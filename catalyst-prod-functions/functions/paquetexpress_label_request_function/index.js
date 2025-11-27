'use strict';

const axios = require('axios');
const https = require('https');


module.exports = async (req, res) => {
	try {
		// console.log("req", req);
		
        const requestUrl = new URL(req.url, 'http://localhost');

		const trackingNumber = requestUrl.searchParams.get('trackingNumber');


		if (!trackingNumber) {
			// --- SINTAXIS CORRECTA PARA CATALYST (ERROR) ---
			res.writeHead(400, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify({ success: false, error: 'Falta el número de guía.' }));
			return;
		}


		const labelUrl = `${process.env.BASE_URL}/wsReportPaquetexpress/GenCartaPorte?trackingNoGen=${trackingNumber}&measure=4x6`;


		const agent = new https.Agent({
			rejectUnauthorized: false
		});

		console.log("labelUrl", labelUrl);
		console.log("trackingNumber", trackingNumber);

		// 3. Usa el agente en tu petición de axios
		const response = await axios.get(labelUrl, {
			responseType: 'arraybuffer',
			httpsAgent: agent
		});

		const base64String = Buffer.from(response.data, 'binary').toString('base64');

		res.writeHead(200, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			labelPdfBase64: base64String
		}));


	} catch (error) {
		console.error("Error en la función de proxy de Catalyst:", error);

		// --- SINTAXIS CORRECTA PARA CATALYST (ERROR) ---
		res.writeHead(500, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: 'No se pudo obtener la etiqueta.'
		}));
		// ------------------------------------------
	}
};