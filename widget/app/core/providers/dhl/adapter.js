import { logRequest } from "../../../ui/js/features/log.js";
import { checkDHLResponse, checkDHLResponseBody, checkDHLRatesResponseBody, checkDHLShipmentsResponseBody } from "../../../ui/js/features/errorToast.js";
import { ConfigService } from '../../services/config.service.js';

const DHL_BASE_URL = "https://express.api.dhl.com/mydhlapi";
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
        console.log(ratesBody);
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

        const { sender, receiver, packageInfo } = formData;

        // Use a for loop to iterate over each cantidadValue
        for (let i = 0; i < packageInfo.cantidadInput; i++) {

            // Create a package object
            const packageObj = {
                weight: Number(packageInfo.pesoInput),
                dimensions: {
                    length: Number(packageInfo.longitudInput),
                    width: Number(packageInfo.anchoInput),
                    height: Number(packageInfo.alturaInput)
                },
                "description": packageInfo.descripcionInput

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
            localProductCode: selectedRateData.localProductCode,
            accounts: [
                {
                    typeCode: "shipper",
                    number: "985524658"
                }
            ],
            customerDetails: {
                shipperDetails: {
                    postalAddress: {
                        postalCode: sender.codigoPostalInput,
                        cityName: sender.ciudadInput,
                        countryCode: "MX",
                        addressLine1: sender.direccionInput,
                        addressLine2: sender.direccion2Input,
                        // "ddressLine3": senderDireccion3Value,
                        countyName: sender.ciudadInput,
                        provinceName: sender.estadoInput,
                        countryName: "MEXICO"
                    },
                    contactInformation: {
                        email: sender.emailInput,
                        phone: sender.telefonoInput,
                        companyName: sender.empresaInput,
                        fullName: sender.nombreInput
                    },
                    typeCode: "business"
                },
                receiverDetails: {
                    postalAddress: {
                        postalCode: receiver.codigoPostalInput,
                        cityName: receiver.ciudadInput,
                        countryCode: "MX",
                        addressLine1: receiver.direccionInput,
                        addressLine2: receiver.direccion2Input,
                        // "ddressLine3": receiverDireccion3Value,
                        countyName: receiver.ciudadInput,
                        provinceName: receiver.estadoInput,
                        countryName: "MEXICO"
                    },
                    contactInformation: {
                        email: receiver.emailInput,
                        phone: receiver.telefonoInput,
                        companyName: receiver.empresaInput,
                        fullName: receiver.nombreInput
                    },
                    typeCode: "direct_consumer"
                }
            },
            content: {
                packages: shipmentsPackages,
                isCustomsDeclarable: false,
                description: packageInfo.descripcionInput,
                incoterm: "DAP",
                unitOfMeasurement: "metric"
            },
            estimatedDeliveryDate: {
                isRequested: false,
                typeCode: "QDDC"
            }
        };

        console.log(JSON.stringify(dhlRequestBody, null, 2))

        const DHL_URL_COMPLEMENT = ConfigService.getOrgId() == '808492068' ? '/test' : '';

 
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

        console.log("shipmentOptions", shipmentOptions);

        const response = await ZFAPPS.request(shipmentOptions);
        console.log("response", response);
        const shipmentBody = JSON.parse(response.data.body);
        
        console.log(JSON.stringify(shipmentBody, null, 2));

        checkDHLResponse(response);
        checkDHLResponseBody(shipmentBody);
        checkDHLShipmentsResponseBody(shipmentBody);

        return {
            provider: 'dhl',
            trackingNumber: shipmentBody.shipmentTrackingNumber,
            labelsPdfContent: shipmentBody.documents.map((doc) => { return {content: doc.content, contentLenght: doc.content.length} }),
            trackingUrl: shipmentBody.trackingUrl
        };
    }

}