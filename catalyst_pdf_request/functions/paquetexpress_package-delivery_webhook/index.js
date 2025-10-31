'use strict';

const { IncomingMessage, ServerResponse } = require("http");
const express = require('express');
var catalyst = require('zcatalyst-sdk-node');
const axios = require('axios');
const FormData = require('form-data');
// const { Readable } = require('stream'); 
const fs = require('fs');
const path = require('path');
const os = require('os');

const { table } = require("console");

let app = express();;
let catalystApp = null;

app.use(express.json({ limit: '6mb' }));
app.use(express.urlencoded({ limit: '6mb', extended: true }));

async function getInventoryAccessToken() {

	let inventoryToken = null;

	try {

		let connector = catalystApp.connection({
			inventoryConn: {
				client_id: process.env.CLIENT_ID,
				client_secret: process.env.CLIENT_SECRET,
				auth_url: process.env.AUTH_URL,
				refresh_url: process.env.REFRESH_URL,
				refresh_token: process.env.REFRESH_TOKEN,
				refresh_in: process.env.REFRESH_IN
			}
		}).getConnector('inventoryConn');

		inventoryToken = await connector.getAccessToken();

		// console.log("inventoryToken", inventoryToken);

	} catch (error) {
		console.error("Error CRÍTICO al obtener token de Inventory:", error);
		throw new Error(`getInventoryAccessToken falló: ${error.message}`);
	}

	return inventoryToken;
}

async function getOrgID() {
	try {
		let zcql = catalystApp.zcql();
		let queryOrgID = "SELECT value FROM env WHERE label = 'inventory_organization_id'";

		let queryResult = await zcql.executeZCQLQuery(queryOrgID);

		// console.log("query result", queryResult);
		const orgID = queryResult?.[0]?.env?.value;

		if (!orgID) {
			throw new Error("No se encontró 'inventory_organization_id' en la tabla env.");
		}
		return orgID;

	} catch (error) {
		console.error("Error CRÍTICO al obtener OrgID:", error);
		throw new Error(`getOrgID falló: ${error.message}`);
	}
	// allTablesDataStore.forEach(async table => {
	// 	const tableName = table._tableDetails.table_name;
	// 	const tableColumns = await table.getAllColumns();
	// 	console.log("table.getAllColumns", tableColumns );
	// 	if (tableName === "env") {
	// 		organizationTable = table;
	// 		console.log("organizationTable", organizationTable);
	// 	}

	// });

	// if (!organizationTable) {
	// 	// serverResponse(res, 400, "No existe la tabla", false);

	// }

	// console.log("orgID", orgID);
}


async function attachImage(base64Image, fileName, endpointUrl, accessToken) {

	const base64Data = base64Image.split(',').pop();
	const imageBuffer = Buffer.from(base64Data, 'base64');

	const getMimeTypeFromFileName = (name) => {
		const ext = name.split('.').pop().toLowerCase();
		switch (ext) {
			case 'jpg':
			case 'jpeg': return 'image/jpeg';
			case 'png': return 'image/png';
			case 'gif': return 'image/gif';
			case 'webp': return 'image/webp';
			default: return 'application/octet-stream';
		}
	};
	const mimeType = getMimeTypeFromFileName(fileName);

	const formData = new FormData();

	formData.append('attachment', imageBuffer, {
		filename: fileName,
		contentType: mimeType
	});

	const fullUrl = `${endpointUrl}`;
	console.log(`Enviando a (axios): ${fullUrl}`);

	const config = {
		headers: {
			'Authorization': `Zoho-oauthtoken ${accessToken}`,

			...formData.getHeaders()
		}
	};

	try {
		const response = await axios.post(fullUrl, formData, config);

		console.log('Respuesta de adjuntar imagen (axios):', response.data);
		return { success: true, data: response.data };

	} catch (error) {
		console.error('Error al subir con Axios:', error.response ? error.response.data : error.message);

		let errorMsg = error.message;
		if (error.response && error.response.data) {
			errorMsg = error.response.data.message || JSON.stringify(error.response.data);
		}

		return { success: false, errorMsg: errorMsg };
	}
}

async function markShipmentAsDelivered(shipmentId, orgId, inventoryToken) {


	let success = true;
	let errorMsg = "";

	try {
		const url = `https://www.zohoapis.com/inventory/v1/shipmentorders/${shipmentId}/status/delivered?organization_id=${orgId}`;

		const data = {};

		const config = {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Zoho-oauthtoken ` + inventoryToken
			}
		};

		console.log('Enviando petición POST a:', url);

		const response = await axios.post(url, data, config);

		console.log('shipmentorders response: ', response.data);

	} catch (error) {
		success = false;

		if (error.response) {
			console.error('Error de respuesta:', error.response.data);
			errorMsg = error.response.data.message || `Error ${error.response.status}`;
		} else if (error.request) {
			console.error('No se recibió respuesta:', error.request);
			errorMsg = 'No se pudo conectar con el servidor.';
		} else {
			console.error('Error de configuración:', error.message);
			errorMsg = error.message;
		}
	}

	return { success, errorMsg };
}

async function processWebhook(trackingNumber, firmaBase64) {

	const orgID = await getOrgID();
	const inventoryToken = await getInventoryAccessToken();

	const options = {
		method: 'GET',
		headers: {
			Authorization: "Zoho-oauthtoken " + inventoryToken
		}
	};

	const shipmentOrderRequest = fetch(`https://www.zohoapis.com/inventory/v1/shipmentorders?organization_id=${orgID}&tracking_number=${trackingNumber}`, options)

	const shipmentOrderResponse = await (await shipmentOrderRequest).json();

	console.log("shipmentOrderResponse", shipmentOrderResponse);

	const shipmentOrders = shipmentOrderResponse?.shipmentorders;

	if (!shipmentOrders || shipmentOrders.length === 0) {
		throw new Error(`No se encontró ningún envío con el trackingNumber: ${trackingNumber}`);
	}

	let hasFailures = false;
	let failureMessages = [];

	let shipmentsData = shipmentOrders.map(shipment => {
		return {
			shipmentID: shipment.shipment_id,
			shipmentNumber: shipment.shipment_number,
			provider: shipment.carrier
		}
	});

	console.log("shipmentOrderResponse", shipmentsData);

	for (const shipment of shipmentsData) {
		const shipmentID = shipment.shipmentID;
		const shipmentNumber = shipment.shipmentNumber;

		const deliveredResult = await markShipmentAsDelivered(shipmentID, orgID, inventoryToken);

		if (!deliveredResult.success) {
			hasFailures = true;
			const errorMsg = `Falló markShipmentAsDelivered para ${shipmentID}: ${deliveredResult.errorMsg}`;
			console.error(errorMsg);
			failureMessages.push(errorMsg);
			continue;
		}

		const fileName = `PAQUETEXPRESS-${shipmentNumber}-${trackingNumber}.jpeg`;
		const url = `https://www.zohoapis.com/inventory/v1/shipmentorders/${shipmentID}/attachment?organization_id=${orgID}`;

		const attachResult = await attachImage(firmaBase64, fileName, url, inventoryToken, orgID);

		if (!attachResult.success) {
			hasFailures = true;
			const errorMsg = `Falló attachImage para ${shipmentID}: ${attachResult.errorMsg}`;
			console.error(errorMsg);
			failureMessages.push(errorMsg);
		}
	}

	if (hasFailures) {
		throw new Error(`Procesamiento parcial completado con errores: ${failureMessages.join(', ')}`);
	}

	return { success: true, message: "Todos los envíos procesados." };

}


async function sendEmailSupport(trackingNumber, errorMessage) {
	try {
		console.log("Enviando correo de notificación a soporte...");
		let email = catalystApp.email();

		const fromEmail = process.env.SUPPORT_FROM_EMAIL || 'rodrigo.juarez@solvisconsulting.com';
		const toEmail = process.env.SUPPORT_TO_EMAIL || 'support@solvisconsulting.com';

		let config = {
			from_email: fromEmail,
			to_email: [toEmail],
			subject: `ALERTA: Falló la entrega del webhook de Paquetexpress - Guía ${trackingNumber}`,

			html_mode: true,
			content: `
                <p>El sistema no pudo procesar automáticamente una firma de entrega de Paquetexpress.</p>
                <ul>
                    <li><strong>Guía:</strong> ${trackingNumber}</li>
                    <li><strong>Error:</strong> ${errorMessage.substring(0, 1000)}</li>
                </ul>
                <p>Revise el File Store de Catalyst (Carpeta: EntregasFallidas).</p>
                <p>Este es un mensaje automático.</p>
            `,
		};

		await email.sendMail(config);
		console.log("Correo de soporte enviado exitosamente.");

	} catch (emailError) {

		console.error("¡¡ERROR CRÍTICO!! Falló el envío del correo de soporte.");
		console.error(emailError);
	}
}


async function saveFailedWebhook(trackingNumber, firmaBase64, errorMessage) {
	let fileId = null;
	const fileName = `FALLIDA-${trackingNumber}-${Date.now()}.jpeg`;
	const tempFilePath = path.join(os.tmpdir(), fileName);

	try {

		let zcql = catalystApp.zcql();

		const query = "SELECT value FROM env WHERE label = 'entregas_fallidas_folder_id_file_storage'";
		const queryResult = await zcql.executeZCQLQuery(query);

		const folderID = queryResult?.[0]?.env?.value;
		let filestore = catalystApp.filestore();
		let folder = filestore.folder(folderID);

		const base64Data = firmaBase64.split(',').pop();
		const imageBuffer = Buffer.from(base64Data, 'base64');

		fs.writeFileSync(tempFilePath, imageBuffer);

		let config = {
			code: fs.createReadStream(tempFilePath),
			name: fileName
		};

		const uploadResponse = await folder.uploadFile(config);

		fileId = uploadResponse.id;

		console.log(`Firma guardada en File Store con ID: ${fileId}`);

	} catch (fileError) {
		// console.error("¡¡ERROR CRÍTICO!! No se pudo guardar la IMAGEN del webhook fallido en File Store.");
		// console.error("Payload perdido:", { trackingNumber, errorMessage });
		// console.error("Error de File Store:", fileError);

		errorMessage = `FALLÓ FILESTORE: ${fileError.message} | Error original: ${errorMessage}`;
		console.log(errorMessage);
	} finally {
		if (fs.existsSync(tempFilePath)) {
			fs.unlinkSync(tempFilePath);
			console.log("Archivo temporal limpiado.");
		}
	}

	try {
		// let zcql = catalystApp.zcql();
		const tableName = "EntregasFallidas";
		const rowData = {
			trackingNumber: trackingNumber,
			fileId: fileId,
			errorMessage: errorMessage.substring(0, 1000)
		};

		// const rowData = `INSERT INTO ${tableName} (trackingNumber, fileId, errorMessage) VALUES ('${data.trackingNumber}', '${data.fileId ?? ""}', '${data.errorMessage}')`;

		let datastore = catalystApp.datastore();
		let table = datastore.table(tableName);

		let insertPromise = table.insertRow(rowData);
		await insertPromise;

		// console.log("queryDataStore", query);

		// await zcql.executeZCQLQuery(query);
		console.log("Metadatos del webhook fallido guardados en Data Store.");

	} catch (dbError) {
		console.error("ERROR CRÍTICO - No se pudo guardar los METADATOS en Data Store.");
		console.error("Datos de DB perdidos:", { trackingNumber, fileId, errorMessage });
		console.error("Error de Data Store:", dbError);
	}

	try {
		await sendEmailSupport(trackingNumber, errorMessage);
	} catch (error) {
		console.error("Error mandando el email. ", error);
	}


}


app.post('/', async (req, res) => {

	catalystApp = catalyst.initialize(req);

	var url = req.url;
	const { firmaBase64, trackingNumber, fechaHoraEntrega, nombreReceptor } = req.body;

	if (!firmaBase64 || !trackingNumber || !fechaHoraEntrega ) {
		res.status(401).json({ "error": "Bad Request: Missing required fields" });
		return;
	}

	const EXPECTED_TOKEN = process.env.EXPECTED_TOKEN;
	const authHeader = req.headers['x-auth-token'];
	let receivedToken = null;



	if (authHeader) {
		const parts = authHeader.split(' ');
		if (parts.length === 2 && parts[0] === 'Bearer') {
			receivedToken = parts[1];
		}
	}


	if (receivedToken !== EXPECTED_TOKEN) {
		console.warn("Acceso no autorizado al webhook (Token inválido).");
		res.status(401).json({ "error": "Unauthorized" });
		return;
	}

	try {

		// console.log(`Procesando Webhook para: ${trackingNumber}`);
		await processWebhook(trackingNumber, firmaBase64);

		res.status(200).json({ status: "processed" });

	} catch (error) {
		console.error(`Falló el procesamiento del webhook para ${trackingNumber}. Guardando para reintento...`);
		console.error("Error original:", error.message);

		await saveFailedWebhook(trackingNumber, firmaBase64, error.message);

		res.status(200).json({ status: "processed" });
	}

	res.end();
});

module.exports = app;