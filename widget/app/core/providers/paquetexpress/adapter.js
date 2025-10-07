import { ConfigService } from '../../services/config.service.js';

const PAQUETEXPRESS_BASE_URL = "https://qaglp.paquetexpress.com.mx/WsQuotePaquetexpress"; 


export class PaquetexpressAdapter {

    async getRates(formData) {
        console.log("Traduciendo datos para PaquetExpress...", formData);

        // --- 1. DATOS DE CONFIGURACIÓN Y CREDENCIALES (Estáticos) ---
        const requestHeader = {
            security: {
                user: "WSQLUNALABS",
                password: "1234",
                type: 1,
                token: "3DE9B062CDDD4334E063350AA8C05C9E"
            },
            device: { appName: "Customer", type: "Web", ip: "", idDevice: "" },
            target: { module: "QUOTER", version: "1.0", service: "quoter", uri: "quotes", event: "R" },
            output: "JSON",
            language: null,
        };

        const defaultServices = {
            dlvyType: "1",      //  Tipo de entrega - 0=Ocurre, 1=Entrega a domicilio 
            ackType: "N",       // Acuse de recibo - C=CLIENTE, I=INTERNO, X=EXTENDIDA, N=SIN ACUSE
            // totlDeclVlue: 1000, // Valor declarado Valor declarado para seguro de envío
            invType: "A", // N=SIN SEGURO, A=COBERTURA AMPLIA
            radType: "1" // Servicio de recoleccion a domicilio (para clientes de documentacion en linea siempre se cargará RAD) - 0=No, 1=Si
        };

        const otherServices = {
            otherServices: []
        };

        const requestData = {
            clientAddrOrig: {
                zipCode: formData.sender.codigoPostalInput,
                colonyName: formData.sender.direccion2Input
            },
            clientAddrDest: {
                zipCode: formData.receiver.codigoPostalInput,
                colonyName: formData.receiver.direccion2Input
            },
            services: defaultServices,
            otherServices,
            shipmentDetail: {
                shipments: [
                    {
                        sequence: 1,
                        quantity: Number(formData.packageInfo.cantidadInput),
                        shpCode: "2", // Tipo de bultos: 1 = Sobre, 2 = Caja
                        weight: Number(formData.packageInfo.pesoInput),
                        longShip: Number(formData.packageInfo.longitudInput),
                        widthShip: Number(formData.packageInfo.anchoInput),
                        highShip: Number(formData.packageInfo.alturaInput)
                    }
                ]
            },
            quoteServices: ["ALL"]
        };

        // --- 4. CONSTRUCCIÓN DE LA PETICIÓN FINAL ---
        const pqxRequestBody = {
            header: requestHeader,
            body: {
                request: { data: requestData, objectDTO: null }
            }
        };

        const pqxOptions = {
            url: `${PAQUETEXPRESS_BASE_URL}/api/apiQuoter/v2/getQuotation`, // URL que te dieron
            method: 'POST',
            body: { raw: JSON.stringify(pqxRequestBody), mode: 'raw' }
        };

        console.log("Enviando a PaquetExpress:", JSON.stringify(pqxRequestBody, null, 2));

        const response = await ZFAPPS.request(pqxOptions);
        console.log("response", response);
        const responseBody = JSON.parse(response.data.body);

        console.log("responseBody", responseBody);
        // const cleanRates = this._transformResponse(responseBody);
        // return cleanRates;

        // Por ahora, devuelve un resultado de prueba para verificar la conexión
        return [{
            provider: 'paquetexpress',
            serviceName: 'PaqueteExpress Terrestre (Prueba)',
            price: '250.00',
            currency: 'MXN',
            estimatedDelivery: 'Viernes, 10 de octubre',
            originalData: {}
        }];
    }

    _transformResponse(responseBody) {
        // Aquí irá la lógica para convertir la RESPUESTA de PaquetExpress a tu StandardRateModel
    }
}