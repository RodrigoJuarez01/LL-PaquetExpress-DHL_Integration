class DhlAdapter {

    async getRates(formData) {

        const ratesPackages = [];
        for (let i = 0; i < Number(formData.package.cantidad); i++) {
            ratesPackages.push({
                weight: Number(formData.package.peso),
                dimensions: {
                    length: Number(formData.package.longitud),
                    width: Number(formData.package.ancho),
                    height: Number(formData.package.altura)
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
            url: 'https://express.api.dhl.com/mydhlapi/rates', // URL base + endpoint
            method: 'POST',
            connection_link_name: 'dhl_api_conn', // Desde config
            body: { raw: JSON.stringify(dhlRequestBody), mode: 'raw' },
            header: [{ key: 'Content-Type', value: 'application/json' }, { key: 'Accept', value: 'application/json' }, { key: 'Accept-Encoding', value: 'gzip, deflate, br' }, { key: 'Connection', value: 'keep-alive' }]
        };

        // 2. LLAMAR A LA API DE DHL
        const response = await ZFAPPS.request(ratesOptions);
        const ratesBody = JSON.parse(response.data.body);

        // 3. PROCESAR Y DEVOLVER DATOS LIMPIOS
        // Transforma la respuesta compleja de DHL en una lista simple que la UI pueda usar.
        const cleanRates = ratesBody.products.map(product => {
            return {
                serviceName: product.productName,
                price: product.totalPrice.find(p => p.priceCurrency === "MXN")?.price || "N/A",
                deliveryDate: product.deliveryCapabilities.estimatedDeliveryDateAndTime,
                productCode: product.productCode // Muy importante para el siguiente paso
            };
        });

        return cleanRates;
    }
}