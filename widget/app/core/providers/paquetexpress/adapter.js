import { ConfigService } from '../../services/config.service.js';

const PAQUETEXPRESS_BASE_URL = "https://qaglp.paquetexpress.com.mx/WsQuotePaquetexpress";


export class PaquetexpressAdapter {

    _transformResponse(responseBody) {
        if (!responseBody?.body?.response?.data?.quotations) {
            console.error("Respuesta de PaquetExpress inválida o sin cotizaciones.");
            return [];
        }

        const quotations = responseBody.body.response.data.quotations;

        const cleanRates = quotations.map(quote => {
            return {
                provider: 'paquetexpress',
                serviceName: quote.serviceName,
                price: quote.amount.totalAmnt,
                currency: 'MXN',
                estimatedDelivery: quote.serviceInfoDescr,
                originalData: quote
            };
        });

        return cleanRates;
    }

    async getRates(formData) {
        console.log("Traduciendo datos para PaquetExpress...", formData);

        // --- 1. DATOS DE CONFIGURACIÓN Y CREDENCIALES (Estáticos) ---
        const requestHeader = {
            security: {
                user: "WSQLUNALABS",
                type: 0,
                token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJXU1FMVU5BTEFCUyJ9.3l0IkzwDyUqBUEuMjR5fv6Bnrxt8QgE4ssxksaHhCV4"
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
        return this._transformResponse(responseBody);
    }

    async createShipment(formData, selectedRateData) {
        console.log("Creando envío con PaquetExpress...");

        // --- 1. DATOS DE CONFIGURACIÓN Y CREDENCIALES ---
        const requestHeader = { /*... tu objeto header con el token ...*/ };

        // --- 2. "TRADUCCIÓN" DE LOS DATOS ---
        const requestData = {
            // Datos generales del envío
            billClntId: "14221805", // Esto parece ser un ID de cliente fijo
            pymtMode: "PAID",
            comt: formData.packageInfo.descripcion, // Usamos la descripción del paquete

            // Dirección de Origen (Sender)
            radGuiaAddrDTOList: [
                {
                    addrLin1: "MEXICO",
                    addrLin3: formData.sender.estado,
                    addrLin4: formData.sender.ciudad, // O municipio si lo tienes
                    addrLin5: formData.sender.ciudad,
                    addrLin6: "NA", // No tienes la colonia en el form, usamos un placeholder
                    zipCode: formData.sender.codigoPostal,
                    strtName: formData.sender.direccion,
                    drnr: "0", // No tienes el número exterior, usamos un placeholder
                    phno1: formData.sender.telefono,
                    clntName: formData.sender.empresa,
                    email: formData.sender.email,
                    contacto: formData.sender.name,
                    addrType: "ORIGIN"
                },
                // Dirección de Destino (Receiver)
                {
                    addrLin1: "MEXICO",
                    addrLin3: formData.receiver.estado,
                    addrLin4: formData.receiver.ciudad, // O municipio
                    addrLin5: formData.receiver.ciudad,
                    addrLin6: "NA",
                    zipCode: formData.receiver.codigoPostal,
                    strtName: formData.receiver.direccion,
                    drnr: "0",
                    phno1: formData.receiver.telefono,
                    clntName: formData.receiver.empresa,
                    email: formData.receiver.email,
                    contacto: formData.receiver.name,
                    addrType: "DESTINATION"
                }
            ],

            // Detalles del Paquete
            radSrvcItemDTOList: [
                {
                    srvcId: "PACKETS",
                    weight: formData.packageInfo.peso,
                    volL: formData.packageInfo.longitud,
                    volW: formData.packageInfo.ancho,
                    volH: formData.packageInfo.altura,
                    cont: formData.packageInfo.descripcion,
                    qunt: formData.packageInfo.cantidad
                }
            ],

            // ¡IMPORTANTE! El servicio que el usuario seleccionó
            typeSrvcId: selectedRateData.originalData.id // Usamos el 'id' de la tarifa guardada
        };

        // --- 3. CONSTRUCCIÓN DE LA PETICIÓN FINAL ---
        const pqxRequestBody = {
            header: requestHeader,
            body: {
                request: { data: [requestData] } // OJO: `data` es un array que contiene un objeto
            }
        };

        const pqxOptions = { /* ... url, method, connection, body ... */ };

        // --- 4. LLAMADA A LA API Y PROCESAMIENTO ---
        // const response = await ZFAPPS.request(pqxOptions);
        // const responseBody = JSON.parse(response.data.body);
        // return this._transformShipmentResponse(responseBody); // Debes crear este "traductor"

        // Por ahora, devolvemos un resultado de prueba
        return {
            provider: 'paquetexpress',
            trackingNumber: 'PQX1234567890',
            trackingUrl: 'https://rastreo.paquetexpress.com.mx/',
            labelPdfBase64: '...' // PDF de prueba en Base64
        };
    }

    _transformShipmentResponse(responseBody) {
        // Aquí transformarás la respuesta de PaquetExpress al `StandardShipmentResult`
    }


}