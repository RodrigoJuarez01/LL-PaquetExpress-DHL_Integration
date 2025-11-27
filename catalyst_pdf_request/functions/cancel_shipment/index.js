'use strict';

const axios = require('axios');
const https = require('https');

const PAQUETEXPRESS_API_TOKEN = process.env.PAQUETEXPRESS_API_TOKEN;
const PAQUETEXPRESS_BASE_URL = process.env.PAQUETEXPRESS_BASEURL;
const PAQUETEXPRESS_API_USER = process.env.PAQUETEXPRESS_API_USER;

module.exports = async (context, basicIO) => {
	const trackingNumber = basicIO.getArgument('trackingNumber');

	if (!trackingNumber) {
		basicIO.write(JSON.stringify({ success: false, error: '...' }));
		return context.close(); // Cierra la función
	}

	// 2. Construir el Body para PaquetExpress
	const pqxRequestBody = {
		header: {
			security: {
				user: PAQUETEXPRESS_API_USER,
				token: PAQUETEXPRESS_API_TOKEN,
			}
		},
		body: {
			request: {
				data: [trackingNumber]
			}
		}
	};


	try {
		const response = await axios.post(
			`${PAQUETEXPRESS_BASE_URL}/RadRestFul/api/rad/v1/cancelguia`,
			pqxRequestBody
		);

		basicIO.write(JSON.stringify(response.data));
		context.close();

	} catch (error) {
		console.error("Error en proxy de Catalyst al cancelar:", error.response?.data || error.message);
		basicIO.write(JSON.stringify({ success: false, error: error }));
		context.close();
	}
};