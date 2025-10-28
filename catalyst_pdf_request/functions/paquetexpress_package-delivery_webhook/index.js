'use strict';

const { IncomingMessage, ServerResponse } = require("http");
var catalyst = require('zcatalyst-sdk-node');

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

	fetch(`https://www.zohoapis.com/inventory/v1/shipmentorders?organization_id=${orgID}&tracking_number=${trackingNumber}`, options)
		.then(response => response.json())
		.then(response => console.log("response", response))
		.catch(err => console.error(err));


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