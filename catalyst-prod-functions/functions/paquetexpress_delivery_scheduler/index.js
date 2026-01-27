'use strict';

const catalyst = require('zcatalyst-sdk-node');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const os = require('os');

const TABLE_NAME = "Webhook_Staging";
const MAX_RETRIES = 3;


async function getInventoryAccessToken(catalystApp) {
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

		return await connector.getAccessToken();

		// console.log("inventoryToken", inventoryToken);

	} catch (error) {
		console.error("Error crítico al obtener token de Inventory:", error.message);
		throw new Error(`getInventoryAccessToken falló: ${error.message}`);
	}

}

async function sendEmailSupport(catalystApp, trackingNumber, errorMessage) {
	try {
		console.log("Enviando correo de notificación a soporte...");
		let email = catalystApp.email();

		const fromEmail = process.env.SUPPORT_FROM_EMAIL || 'javier.marcelo@solvisconsulting.com';
		const toEmail = process.env.SUPPORT_TO_EMAIL || 'support@solvisconsulting.com';

		let config = {
			from_email: fromEmail,
			to_email: [toEmail],
			subject: `ALERTA: Falló en staging webhook Paquetexpress - Guía ${trackingNumber}`,

			html_mode: true,
			content: `
                <p>El sistema no pudo encolar una firma de entrega de Paquetexpress.</p>
                <ul>
                    <li><strong>Guía:</strong> ${trackingNumber}</li>
                    <li><strong>Error:</strong> ${errorMessage.substring(0, 250)}</li>
                </ul>
                <p>Este es un mensaje automático, pertenece a una integración de Rodrigo.</p>
            `,
		};

		await email.sendMail(config);
		console.log("Correo de soporte enviado exitosamente.");

	} catch (emailError) {
		console.error("Error critico - Falló el envío del correo de soporte.");
		console.error(emailError);
	}
}

async function attachImage(catalystApp, fileId, trackingNumber, shipmentID, orgID, accessToken) {

	let tempFilePath = null;
	
	try {
		const folderID = process.env.STAGING_FILES_FOLDER_ID;

		if (!folderID) throw new Error("Falta STAGING_FILES_FOLDER_ID");

		const filestore = catalystApp.filestore();
		const folder = filestore.folder(folderID);

		const fileStream = await folder.downloadFile(fileId);

		const fileName = `EVIDENCIA-${trackingNumber}.jpeg`;
		tempFilePath = path.join(os.tmpdir(), fileName);

		const writer = fs.createWriteStream(tempFilePath);
		fileStream.pipe(writer);

		await new Promise((resolve, reject) => {
			writer.on('finish', resolve);
			writer.on('error', reject);
		});

		const form = new FormData();
		form.append('attachment', fs.createReadStream(tempFilePath));

		const attachUrl = `https://www.zohoapis.com/inventory/v1/shipmentorders/${shipmentID}/attachment?organization_id=${orgID}`;

		await axios.post(attachUrl, form, {
			headers: {
				Authorization: `Zoho-oauthtoken ${accessToken}`,
				...form.getHeaders()
			}
		});

		console.log(`Imagen adjuntada correctamente al envío ${shipmentID}`);

	} catch (error) {
		console.warn(`No se pudo adjuntar imagen para ${shipmentID} de la guía ${trackingNumber}, Error ${error}`);
	} finally {
		if (tempFilePath && fs.existsSync(tempFilePath)) {
			fs.unlinkSync(tempFilePath);
		}
	}


}

async function processSingleRecord(catalystApp, record, accessToken, orgID) {
	const { ROWID, trackingNumber, fileId } = record.Webhook_Staging;

	try {
		console.log(`- - - - Procesando Guía: ${trackingNumber} (ID: ${ROWID}) - - - -`);

		const searchUrl = `https://www.zohoapis.com/inventory/v1/shipmentorders?organization_id=${orgID}&tracking_number=${trackingNumber}`;

		const searchRes = await axios.get(searchUrl, {
			headers: { Authorization: `Zoho-oauthtoken ${accessToken}` }
		});

		const shipments = searchRes.data.shipmentorders;

		if (!shipments || shipments.length === 0) {
			console.error(`No se ha encontrado ningún envío para el tracking number ${trackingNumber}`);
			return { success: false, error: `No se ha encontrado ningún envío para el tracking number ${trackingNumber}` };
		}

		for (const ship of shipments) {
			const shipmentID = ship.shipment_id;

			const statusUrl = `https://www.zohoapis.com/inventory/v1/shipmentorders/${shipmentID}/status/delivered?organization_id=${orgID}`;

			try {
				await axios.post(statusUrl, {}, { headers: { Authorization: `Zoho-oauthtoken ${accessToken}` } });
				console.log(`Estatus actualizado a Delivered para ${shipmentID}`);
			} catch (error) {
				const zohoCode = error.response?.data?.code;

				if (zohoCode === 37135) {
					console.log(`El envío ${shipmentID} ya estaba marcado como entregado. (Código 37135 - Ignorado)`);

				} else {
					const msg = error.response?.data?.message || error.message;
					throw new Error(`Fallo al actualizar estatus de ${shipmentID}: ${msg}`);
				}
			}

			if (fileId) {
				await attachImage(catalystApp, fileId, trackingNumber, shipmentID, orgID, accessToken);
			}
		}

		return { success: true, error: null };

	} catch (error) {
		const errorMsg = error.response?.data?.message || error.message;
		return { success: false, error: errorMsg };
	}
}


module.exports = async (cronDetails, context) => {
	const catalystApp = catalyst.initialize(context);

	console.log("Iniciando Scheduler...");

	try {
		let zcql = catalystApp.zcql();

		const query = `SELECT * FROM ${TABLE_NAME} WHERE status = 'PENDING' AND retryCount < ${MAX_RETRIES} LIMIT 20`;
		const pendingRecords = await zcql.executeZCQLQuery(query);

		if (!pendingRecords || pendingRecords.length === 0) {
			console.log("No hay registros pendientes.");
			context.closeWithSuccess();
			return;
		}

		console.log(`Se encontraron ${pendingRecords.length} registros para procesar.`);

		const accessToken = await getInventoryAccessToken(catalystApp);
		const orgID = process.env.CURRENT_ORG_ID;

		if (!accessToken || !orgID) throw new Error("Fallo crítico obteniendo credenciales de Zoho.");

		let datastore = catalystApp.datastore();
		let table = datastore.table(TABLE_NAME);

		for (const row of pendingRecords) {
			const recordData = row.Webhook_Staging;
			const currentRowId = recordData.ROWID;
			const currentRetry = parseInt(recordData.retryCount) || 0;

			const result = await processSingleRecord(catalystApp, row, accessToken, orgID);

			let updateData = {
				ROWID: currentRowId
			};

			if (result.success) {
				updateData.status = 'PROCESSED';
				updateData.errorMessage = '';
				console.log(`Guía ${recordData.trackingNumber} procesada.`);
			} else {
				const newRetryCount = currentRetry + 1;
				const safeErrorMsg = result.error ? String(result.error).substring(0, 250) : "Error desconocido";

				updateData.errorMessage = safeErrorMsg;
				updateData.retryCount = newRetryCount;

				if (newRetryCount >= MAX_RETRIES) {
					updateData.status = 'PERMANENT_FAIL';
					await sendEmailSupport(catalystApp, recordData.trackingNumber, safeErrorMsg);

					console.error(`Guía ${recordData.trackingNumber} falló permanentemente tras ${newRetryCount} intentos.`);
				} else {
					updateData.status = 'PENDING';
					console.warn(`Guía ${recordData.trackingNumber} falló. Intento ${newRetryCount}. Error: ${safeErrorMsg}`);
				}
			}

			await table.updateRow(updateData);
		}

		context.closeWithSuccess();


	} catch (criticalError) {
		console.error("Error crítico en la ejecución: ", criticalError);
		context.closeWithFailure();
	}

};
