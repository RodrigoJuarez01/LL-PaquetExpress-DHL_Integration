import { ConfigService } from '../../services/config.service.js';

const PAQUETEXPRESS_BASE_URL = "https://qaglp.paquetexpress.com.mx";
const TOKEN_RATES = "3DE9B062CDDD4334E063350AA8C05C9E";
const USER = "WSQLUNALABS";
const PASSWORD = "1234";
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJXU1FMVU5BTEFCUyJ9.3l0IkzwDyUqBUEuMjR5fv6Bnrxt8QgE4ssxksaHhCV4";
const BILLCLNTID = "14221805";
const CATALYST_API_KEY = "06d8d3adc6a6609b40652707b28a48b4";
const CATALYST_LABEL_URL = "https://integracionpaqueterias-875780419.development.catalystserverless.com/getPaquetexpressLabel";

export class PaquetexpressAdapter {

    _transformResponse(responseBody) {
        if (!responseBody?.body?.response?.data?.quotations) {
            console.error("Respuesta de PaquetExpress inválida o sin cotizaciones.");
            return [];
        }

        const quotations = responseBody.body.response.data.quotations;


        const cleanRates = quotations.map(quote => {

            const cleanDeliveryDate = quote.serviceInfoDescr.replace('Entrega estimada el ', '');

            return {
                provider: 'paquetexpress',
                serviceName: quote.serviceName,
                price: quote.amount.totalAmnt,
                currency: 'MXN',
                estimatedDelivery: cleanDeliveryDate,
                originalData: quote,
                productCode: quote.id,
                localProductCode: quote.idRef,
            };
        });

        return cleanRates;
    }

    async getRates(formData) {
        console.log("Traduciendo datos para PaquetExpress...", formData);

        // --- 1. DATOS DE CONFIGURACIÓN Y CREDENCIALES (Estáticos) ---
        const requestHeader = {
            security: {
                user: USER,
                password: PASSWORD,
                type: 1,
                token: TOKEN_RATES
            },
            device: {
                appName: null,
                type: null,
                ip: "barracuda",
                idDevice: null
            },
            target: null,
            output: null,
            language: null
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

        const pqxRequestBody = {
            header: requestHeader,
            body: {
                request: { data: requestData, objectDTO: null }
            }
        };

        const pqxOptions = {
            url: `${PAQUETEXPRESS_BASE_URL}/WsQuotePaquetexpress/api/apiQuoter/v2/getQuotation`,
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
        return this._transformResponse(responseBody);
    }

    // async getLabel(trackingNumber) {


    //     const labelOptions = {
    //         url: `${CATALYST_LABEL_URL}?trackingNumber=${trackingNumber}&ZCFKEY=${CATALYST_API_KEY}`,
    //         method: 'GET',

    //     };

    //     console.log("Enviando a catalyst:", labelOptions);

    //     const response = await ZFAPPS.request(labelOptions);

    //     console.log("labelResponse", response);

    //     const catalystResponse = JSON.parse(response.data.body);
    //     console.log("catalystResponse", catalystResponse);

    //     return [{ content: catalystResponse?.labelPdfBase64 }];
    // }



    async getLabel(trackingNumber) {
          async function blobToBase64(blob) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result.split(',')[1]);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        }

        function binaryStringToBlob(binaryString) {
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return new Blob([bytes], { type: 'application/pdf' });
        }

        try {
            // --- PASO 1: Obtener la URL segura del webhook de Zoho ---
            // (Equivalente a tu primera llamada `invokeUrl`)

            const orgId = ConfigService.getOrgId();


            const nameSpace = "ef6c8cc3-6eaa-4cb3-a9f6-8a7cf8859014";

            // 1. Construimos la URL COMPLETA a mano, con AMBOS parámetros en la cadena
            const fetchUrlEndpoint = `https://inventory.zoho.com/api/v1/settings/incomingwebhooks/iw__com_iutbg8_getpaqueteexpresslabel/url/fetch?organization_id=${orgId}&name_space=${nameSpace}`;

            const fetchUrlOptions = {
                // 2. Le pasamos la URL final y exacta
                url: fetchUrlEndpoint,
                method: 'GET',
                connection_link_name: 'inventory_all',
                // 3. Eliminamos por completo las claves 'params' y 'body' para esta llamada
            };

            console.log("Intentando con URL manual:", fetchUrlOptions);
            const urlResponse = await ZFAPPS.request(fetchUrlOptions);

            console.log("urlResponse", urlResponse);

            const zapikeyUrl = JSON.parse(urlResponse.data.body).data.url;

            if (!zapikeyUrl) {
                throw new Error("No se pudo obtener la URL del proxy de Zoho.");
            }


            const labelOptions = {
                url: zapikeyUrl,
                method: 'GET',
                responseType: 'blob',
                params: {
                    trackingNoGen: trackingNumber
                }
            };

            const labelResponse = await ZFAPPS.request(labelOptions);


            const labelBody = JSON.parse(labelResponse.data.body);


            if (labelBody.message === "success" && labelBody.response) {

                const pdfBlob = binaryStringToBlob(labelBody.response.response);

                const base64String = await blobToBase64(pdfBlob);

                return [{ content: base64String }];

            } else {
                throw new Error("La llamada a través de la URL del proxy de Zoho falló.");
            }

        } catch (error) {
            console.error("Error al obtener la etiqueta vía Zoho Webhook:", error);
            throw error; // Relanza el error para que el controlador principal lo maneje
        }
    }

    async createShipment(formData, selectedRateData) {
        console.log("Creando envío con PaquetExpress...");

        const { sender, receiver, packageInfo } = formData;

        const requestHeader = {
            security: {
                user: USER,
                type: 0,
                token: TOKEN
            },
            device: {
                appName: null,
                type: null,
                ip: "barracuda",
                idDevice: null
            },
            target: null,
            output: null,
            language: null
        };


        const requestData = {
            billClntId: BILLCLNTID,
            pymtMode: "PAID",
            comt: packageInfo.descripcionInput,
            billRad: "REQUEST", // uien pagará la solicitud, sólo con REQUEST o ORIGIN pueden ser a crédito
            pymtMode: "PAID", // Modo de pago (PAID=PAGADO, TO_PAY=Flete porcobrar)
            pymtType: "C", // Tipo de pago (CREDITO, CONTADO) - N= CONTADO, C=CREDITO
            radGuiaAddrDTOList: [
                {
                    addrLin1: sender.paisInput,
                    addrLin3: sender.estadoInput,
                    addrLin4: sender.ciudadInput, // O municipio si lo tienes
                    addrLin5: sender.ciudadInput,
                    addrLin6: sender.direccion2Input,
                    zipCode: sender.codigoPostalInput,
                    strtName: sender.calleInput,
                    drnr: sender.numeroInput,
                    phno1: sender.telefonoInput,
                    clntName: sender.empresaInput,
                    email: sender.emailInput,
                    contacto: sender.nombreInput,
                    addrType: "ORIGIN"
                },
                // Dirección de Destino (Receiver)
                {
                    addrLin1: receiver.paisInput,
                    addrLin3: receiver.estadoInput,
                    addrLin4: receiver.ciudadInput, // O municipio
                    addrLin5: receiver.ciudadInput,
                    addrLin6: receiver.direccion2Input,
                    zipCode: receiver.codigoPostalInput,
                    strtName: receiver.calleInput, // Separar dirección?
                    drnr: receiver.numeroInput,     // número ?
                    phno1: receiver.telefonoInput,
                    clntName: receiver.empresaInput,
                    email: receiver.emailInput,
                    contacto: receiver.nombreInput,
                    addrType: "DESTINATION"
                }
            ],

            // Detalles del Paquete
            radSrvcItemDTOList: [
                {
                    srvcId: "PACKETS", // PACKETS=Paquetes, ENVELOPES=Sobres 
                    productIdSAT: "01010101", // Buscar
                    weight: packageInfo.pesoInput,
                    volL: packageInfo.longitudInput,
                    volW: packageInfo.anchoInput,
                    volH: packageInfo.alturaInput,
                    cont: packageInfo.descripcionInput,
                    qunt: packageInfo.cantidadInput
                }
            ],

            listSrvcItemDTO: [
                {
                    srvcId: "EAD",
                    value1: ""
                },
                {
                    srvcId: "RAD",
                    value1: ""
                },
            ],
            listRefs: [
                {
                    grGuiaRefr: "A"
                }
            ],

            typeSrvcId: selectedRateData.productCode
        };

        const pqxRequestBody = {
            header: requestHeader,
            body: {
                request: { data: [requestData] },
                response: null
            }
        };


        const pqxOptions = {
            url: `${PAQUETEXPRESS_BASE_URL}/RadRestFul/api/rad/v1/guia`, // URL que te dieron
            method: 'POST',
            body: { raw: JSON.stringify(pqxRequestBody), mode: 'raw' }
        };

        console.log("Enviando a PaquetExpress:", JSON.stringify(pqxRequestBody, null, 2));

        const response = await ZFAPPS.request(pqxOptions);

        console.log("generación guía response: ", JSON.stringify(response, null, 2));

        const responseBody = JSON.parse(response.data.body);

        const pqxResponseBody = responseBody.body;

        console.log("pqxResponseBody ", pqxResponseBody);


        const responseData = pqxResponseBody.response;
        if (!responseData || !responseData.success) {
            throw new Error("No se pudo generar la guía");
        }


        const trackingNumber = responseData.data;

        const labelResponse = await this.getLabel(trackingNumber);


        return {
            provider: 'paquetexpress',
            trackingNumber: trackingNumber,
            trackingUrl: `https://www.paquetexpress.com.mx/rastreo/${trackingNumber}`,
            labelsPdfContent: labelResponse,

        };

        // return {
        //     provider: 'paquetexpress',
        //     trackingNumber: 'PQX1234567890',
        //     trackingUrl: 'https://rastreo.paquetexpress.com.mx/',
        //     labelPdfBase64: '...' // PDF de prueba en Base64
        // };
    }


}