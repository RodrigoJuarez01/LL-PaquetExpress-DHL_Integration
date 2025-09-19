import { logRequest } from "../../../ui/js/features/log.js";
import { checkDHLResponse, checkDHLResponseBody, checkDHLRatesResponseBody } from "../../../ui/js/features/errorToast.js";

const DHL_BASE_URL = "https://express.api.dhl.com/mydhlapi";
const DHL_URL_COMPLEMENT = orgId == '808492068' ? '/test' : '';
const dhlConnectionLinkName = 'dhl_api_conn';

export class DhlAdapter {

    async getRates(formData) {

        console.log("formData", formData);

        const ratesPackages = [];
        for (let i = 0; i < Number(formData.packageInfo.cantidadInput); i++) {
            ratesPackages.push({
                weight: Number(formData.packageInfo.pesoInput),
                dimensions: {
                    length: Number(formData.packageInfo.longitudInput),
                    width: Number(formData.packageInfo.anchoInput),
                    height: Number(formData.packageInfo.alturaInput)
                }
            });
        }

        const { sender, receiver } = formData;

        const dhlRequestBody = {
            customerDetails: {
                shipperDetails: {
                    postalCode: sender.codigoPostalInput,
                    cityName: sender.ciudadInput,
                    countryCode: "MX",
                    addressLine1: sender.direccionInput
                },
                receiverDetails: {
                    postalCode: receiver.codigoPostalInput,
                    cityName: receiver.ciudadInput,
                    countryCode: "MX",
                    addressLine1: receiver.direccionInput
                }
            },
            accounts: [
                {
                    typeCode: "shipper",
                    number: "985524658"
                }
            ],
            plannedShippingDateAndTime: sender.plannedShippingDateAndTime,
            unitOfMeasurement: "metric",
            isCustomsDeclarable: false,
            requestAllValueAddedServices: false,
            returnStandardProductsOnly: false,
            nextBusinessDay: false,
            packages: ratesPackages,
        };

        const ratesOptions = {
            url: DHL_BASE_URL + '/rates', // URL base + endpoint
            method: 'POST',
            connection_link_name: dhlConnectionLinkName, // Desde config
            body: { raw: JSON.stringify(dhlRequestBody), mode: 'raw' },
            header: [{ key: 'Content-Type', value: 'application/json' }, { key: 'Accept', value: 'application/json' }, { key: 'Accept-Encoding', value: 'gzip, deflate, br' }, { key: 'Connection', value: 'keep-alive' }]
        };


        const response = await ZFAPPS.request(ratesOptions);


        console.log('Rates API Response:', response);
        // logRequest(ratesOptions, response);
        checkDHLResponse(response);
        // Handle the response as needed

        const ratesBody = JSON.parse(response.data.body);
        console.log('ratesBody: ');
        console.log(JSON.stringify(ratesBody, null, 2));
        checkDHLResponseBody(ratesBody);
        checkDHLRatesResponseBody(ratesBody);


        const cleanRates = ratesBody.products.map(product => {

            const priceObj = product.totalPrice.find(p => p.priceCurrency === "MXN");

            // Usamos 0 como default para poder filtrar de forma numérica y segura.
            const priceValue = priceObj ? priceObj.price : 0;


            const deliveryDate = new Date(product.deliveryCapabilities.estimatedDeliveryDateAndTime);

            // Formatea la fecha aquí para mantener la UI simple
            const formattedDate = deliveryDate.toLocaleDateString('es-MX', {
                weekday: 'long', month: 'long', day: 'numeric'
            });

            return {
                provider: 'dhl',
                serviceName: product.productName,
                price: priceValue,
                currency: 'MXN',
                // estimatedDelivery: product.deliveryCapabilities.estimatedDeliveryDateAndTime,
                estimatedDelivery: formattedDate,
                productCode: product.productCode,
                originalData: product
            };
        }).filter(rate => rate.price > 0);;

        return cleanRates;
    }


    async createShipment(formData, selectedRateData) {

        const shipmentsPackages = [];

        // Use a for loop to iterate over each cantidadValue
        for (let i = 0; i < cantidadValue; i++) {

            // Create a package object
            const packageObj = {
                weight: pesoValue,
                dimensions: {
                    length: longitudValue,
                    width: anchoValue,
                    height: alturaValue
                },
                "description": descripcionValue

            };

            // Add the package object to the shipmentsPackages array
            shipmentsPackages.push(packageObj);
        }
        console.log('shipmentsPackages: ', shipmentsPackages);

        const dhlRequestBody = {
            plannedShippingDateAndTime: selectedRateData.plannedShippingDateAndTime,
            pickup: {
                isRequested: false,
                closeTime: "18:00",
                location: "reception"
            },
            productCode: selectedRateData.productCode,
            localProductCode: localProductCode,
            accounts: [
                {
                    typeCode: "shipper",
                    number: "985524658"
                }
            ],
            customerDetails: {
                shipperDetails: {
                    postalAddress: {
                        postalCode: senderCodigoPostalValue,
                        cityName: senderCiudadValue,
                        countryCode: "MX",
                        addressLine1: senderDireccionValue,
                        addressLine2: senderDireccion2Value,
                        // "ddressLine3": senderDireccion3Value,
                        countyName: senderCiudadValue,
                        provinceName: senderEstadoValue,
                        countryName: "MEXICO"
                    },
                    contactInformation: {
                        email: senderEmailValue,
                        phone: senderTelefonoValue,
                        companyName: senderEmpresaValue,
                        fullName: senderNombreValue
                    },
                    typeCode: "business"
                },
                receiverDetails: {
                    postalAddress: {
                        postalCode: receiverCodigoPostalValue,
                        cityName: receiverCiudadValue,
                        countryCode: "MX",
                        addressLine1: receiverDireccionValue,
                        addressLine2: receiverDireccion2Value,
                        // "ddressLine3": receiverDireccion3Value,
                        countyName: receiverCiudadValue,
                        provinceName: receiverEstadoValue,
                        countryName: "MEXICO"
                    },
                    contactInformation: {
                        email: receiverEmailValue,
                        phone: receiverTelefonoValue,
                        companyName: receiverEmpresaValue,
                        fullName: receiverNombreValue
                    },
                    typeCode: "direct_consumer"
                }
            },
            content: {
                packages: shipmentsPackages,
                isCustomsDeclarable: false,
                description: descripcionValue,
                incoterm: "DAP",
                unitOfMeasurement: "metric"
            },
            estimatedDeliveryDate: {
                isRequeste: false,
                typeCod: "QDDC"
            }
        };

        const shipmentOptions = {
            url: DHL_BASE_URL + DHL_URL_COMPLEMENT + '/shipments?strictValidation=false&bypassPLTError=false&validateDataOnly=false',
            method: 'POST',
            connection_link_name: dhlConnectionLinkName,
            header: [{
                key: 'Content-Type',
                value: 'application/json'
            },
            {
                key: 'Accept',
                value: 'application/json'
            },
            {
                key: 'Accept-Encoding',
                value: 'gzip, deflate, br'
            },
            {
                key: 'Connection',
                value: 'keep-alive'
            }],
            body: { raw: JSON.stringify(dhlRequestBody), mode: 'raw' }
        };

        const response = await ZFAPPS.request(shipmentOptions);
        const shipmentBody = JSON.parse(response.data.body);

        checkDHLResponse(shipmentsAPIResponse);
        checkDHLResponseBody(shipmentsBody);
        checkDHLShipmentsResponseBody(shipmentsBody);

        return {
            provider: 'dhl',
            trackingNumber: shipmentBody.shipmentTrackingNumber,
            labelPdfBase64: shipmentBody.documents[0].content, // Asumiendo que el PDF viene aquí
            trackingUrl: shipmentBody.trackingUrl
        };
    }

}