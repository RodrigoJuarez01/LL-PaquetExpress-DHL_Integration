'use strict';

const axios = require('axios');
const https = require('https');
const catalyst = require('zcatalyst-sdk-node'); // 1. Importamos el SDK de Catalyst

module.exports = async (req, res) => {

	const catalystApp = catalyst.initialize(req);

	const guardarAuditoria = async (trkNumber, estado, mensaje) => {
		try {
			const tableName = "AuditoriaPeticionesLabelRequest";

			const rowData = {
				trackingNumber: trkNumber || "DESCONOCIDO",
				status: estado,
				details: mensaje ? mensaje.substring(0, 255) : ""
			};

			const datastore = catalystApp.datastore();
			const table = datastore.table(tableName);

			await table.insertRow(rowData);
			console.log(`[Auditoria] Registro guardado: ${estado} - ${trkNumber}`);

		} catch (dbError) {
			console.error("ERROR NO BLOQUEANTE - Fallo al guardar auditoría:", dbError);
		}
	};

	try {
		const requestUrl = new URL(req.url, 'http://localhost');
		const trackingNumber = requestUrl.searchParams.get('trackingNumber');

		if (!trackingNumber) {
			await guardarAuditoria(null, "ERROR_VALIDACION", "Falta el número de guía en la URL");

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

		const response = await axios.get(labelUrl, {
			responseType: 'arraybuffer',
			httpsAgent: agent
		});

		const buffer = Buffer.from(response.data, 'binary');

		const headerSignature = buffer.subarray(0, 4).toString('utf-8');

		if (headerSignature !== '%PDF') {

			const errorText = buffer.toString('utf-8');
			console.warn("PaquetExpress devolvió algo que no es un PDF:", errorText);

			await guardarAuditoria(trackingNumber, "ERROR_API_EXTERNA", `Respuesta no es PDF: ${errorText.substring(0, 50)}`);

			res.writeHead(404, { 'Content-Type': 'application/json' }); // 404 porque no existe
			res.end(JSON.stringify({
				success: false,
				error: 'La guía no generó un PDF válido (Posible guía inexistente).'
			}));
			return;
		}

		const base64String = buffer.toString('base64');

		await guardarAuditoria(trackingNumber, "EXITO", "PDF obtenido y validado correctamente");

		res.writeHead(200, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			labelPdfBase64: base64String
		}));

	} catch (error) {
		console.error("Error en la función de proxy de Catalyst:", error);

		let trkCatch = "DESCONOCIDO";
		try {
			const urlObj = new URL(req.url, 'http://localhost');
			trkCatch = urlObj.searchParams.get('trackingNumber') || "DESCONOCIDO";
		} catch (e) { }

		await guardarAuditoria(trkCatch, "ERROR_SISTEMA", error.message);

		res.writeHead(500, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: 'No se pudo obtener la etiqueta.'
		}));
	}
};
