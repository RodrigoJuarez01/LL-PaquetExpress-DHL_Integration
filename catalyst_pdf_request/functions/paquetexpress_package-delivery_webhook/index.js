'use strict';

const { IncomingMessage, ServerResponse } = require("http");
var catalyst = require('zcatalyst-sdk-node');
const axios = require('axios');
const FormData = require('form-data');

let app = null;

// function serverResponse(res, code, msg, success) {
// 	const payload = {success: success, msg: msg};
// 	res.writeHead(code, { 'Content-Type': 'text/html' });
// 	res.write(msg);
// 	res.end();
// }

async function getInventoryAccessToken() {

	let inventoryToken = null;

	let connector = app.connection({
		inventoryConn: {
			client_id: '1000.SF42CVRR64LS67XVAVAKCYS95RRMBC',
			client_secret: 'd5e3c32eb0e865570f040595a75d89f5904a6a9ee9',
			auth_url: 'https://accounts.zoho.com/oauth/v2/auth?response_type=code&client_id=1000.SF42CVRR64LS67XVAVAKCYS95RRMBC&scope=ZohoInventory.packages.ALL,ZohoInventory.shipmentorders.ALL,ZohoCatalyst.tables.rows.READ&access_type=offline&redirect_uri=https://www.google.com',
			refresh_url: 'https://accounts.zoho.com/oauth/v2/token',
			refresh_token: '1000.129613cbfc0805c76ed997ba2d9e5140.83539a29cf1cfc053008dbbbd787994e',
			refresh_in: '3000'
		}
	}).getConnector('inventoryConn');

	try {
		inventoryToken = await connector.getAccessToken();

		console.log("inventoryToken", inventoryToken);

	} catch (error) {
		console.log(error);
	}


	return inventoryToken;
}

async function getOrgID(app) {
	let zcql = app.zcql();
	let queryOrgID = "SELECT value FROM env WHERE label = 'inventory_organization_id'";

	let queryResult = await zcql.executeZCQLQuery(queryOrgID);

	console.log("query result", queryResult);

	const orgID = queryResult?.[0]?.env?.value;

	if (!orgID) {

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

	console.log("orgID", orgID);

	return orgID;
}


async function attachImage(base64Image, fileName, endpointUrl, baseUrl, accessToken) {

    const base64Data = base64Image.split(',').pop(); 
    const imageBuffer = Buffer.from(base64Data, 'base64');

    const getMimeTypeFromFileName = (name) => {
        const ext = name.split('.').pop().toLowerCase();
        switch (ext) {
            case 'jpg':
            case 'jpeg': return 'image/jpeg';
            case 'png':  return 'image/png';
            case 'gif':  return 'image/gif';
            case 'webp': return 'image/webp';
            default:     return 'application/octet-stream';
        }
    };
    const mimeType = getMimeTypeFromFileName(fileName);

    const formData = new FormData();
    
    formData.append('attachment', imageBuffer, {
        filename: fileName,
        contentType: mimeType
    });

    const fullUrl = `${baseUrl}${endpointUrl}`;
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

module.exports = async (req, res) => {
	var url = req.url;

	const requestUrl = new URL(url, 'http://localhost');

	const trackingNumber = requestUrl.searchParams.get('trackingNumber');

	app = catalyst.initialize(req);

	const orgID = await getOrgID(app);

	const inventoryToken = await getInventoryAccessToken();

	const options = {
		method: 'GET',
		headers: {
			Authorization: "Zoho-oauthtoken " + inventoryToken
		}
	};

	try {
		const shipmentOrderRequest = fetch(`https://www.zohoapis.com/inventory/v1/shipmentorders?organization_id=${orgID}&tracking_number=${trackingNumber}`, options)

		const shipmentOrderResponse = await (await shipmentOrderRequest).json();

		console.log("shipmentOrderResponse", shipmentOrderResponse);

		const shipmentOrders = shipmentOrderResponse?.shipmentorders;

		let shipmentsData = shipmentOrders.map(shipment => {
			return {
				shipmentID: shipment.shipment_id,
				shipmentNumber: shipment.shipment_number,
				provider: shipment.carrier
			}
		});

		console.log("shipmentOrderResponse", shipmentOrderResponse);

		for (const shipment of shipmentsData) {
			markShipmentAsDelivered(shipment.shipmentID, orgID, inventoryToken);
			attachImage(base64Image, fileName, endpointUrl, baseUrl, inventoryToken, org)
		}



	} catch (error) {
		console.log(error);
	}



	switch (url) {
		case '/':
			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.write('<h1>Hello from index.js<h1>');
			break;
		default:
			res.writeHead(404);
			res.write('You might find the page you are looking for at "/" path');
			break;
	}
	res.end();
};