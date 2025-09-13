//
let plannedShippingDateAndTime;

function onSubmitAddresses() {
    spinnerWrapper.style.display = 'flex';
    // Get the values from cantidadInput, pesoInput, longitudInput, anchoInput, alturaInput, descripcionInput
    cantidadValue = Number(cantidadInput.value);
    pesoValue = Number(pesoInput.value);
    longitudValue = Number(longitudInput.value);
    anchoValue = Number(anchoInput.value);
    alturaValue = Number(alturaInput.value);
    descripcionValue = descripcionInput.value;

    // Get the values from the sender form
    senderNombreValue = senderNombreInput.value;
    senderEmpresaValue = senderEmpresaInput.value;
    senderPaisValue = senderPaisInput.value;
    senderDireccionValue = senderDireccionInput.value;
    senderDireccion2Value = senderDireccion2Input.value;
    senderDireccion3Value = senderDireccion3Input.value;
    senderCodigoPostalValue = senderCodigoPostalInput.value;
    senderCiudadValue = senderCiudadInput.value;
    senderEstadoValue = senderEstadoInput.value;
    senderEmailValue = senderEmailInput.value;
    senderTelefonoValue = senderTelefonoInput.value;
    senderFechaValue = senderFechaInput.value;

    // Get the values from the receiver form
    receiverNombreValue = receiverNombreInput.value;
    receiverEmpresaValue = receiverEmpresaInput.value;
    receiverPaisValue = receiverPaisInput.value;
    receiverDireccionValue = receiverDireccionInput.value;
    receiverDireccion2Value = receiverDireccion2Input.value;
    receiverDireccion3Value = receiverDireccion3Input.value;
    receiverCodigoPostalValue = receiverCodigoPostalInput.value;
    receiverCiudadValue = receiverCiudadInput.value;
    receiverEstadoValue = receiverEstadoInput.value;
    receiverEmailValue = receiverEmailInput.value;
    receiverTelefonoValue = receiverTelefonoInput.value;

    // Log the values to the console
    console.log('Sender Nombre:', senderNombreValue);
    console.log('Sender Empresa:', senderEmpresaValue);
    console.log('Sender Pais:', senderPaisValue);
    console.log('Sender Direccion:', senderDireccionValue);
    console.log('Sender Direccion2:', senderDireccion2Value);
    console.log('Sender Direccion3:', senderDireccion3Value);
    console.log('Sender Codigo Postal:', senderCodigoPostalValue);
    console.log('Sender Ciudad:', senderCiudadValue);
    console.log('Sender Estado:', senderEstadoValue);
    console.log('Sender Email:', senderEmailValue);
    console.log('Sender Telefono:', senderTelefonoValue);
    console.log('Sender Fecha:', senderFechaValue);

    console.log('Receiver Nombre:', receiverNombreValue);
    console.log('Receiver Empresa:', receiverEmpresaValue);
    console.log('Receiver Pais:', receiverPaisValue);
    console.log('Receiver Direccion:', receiverDireccionValue);
    console.log('Receiver Direccion2:', receiverDireccion2Value);
    console.log('Receiver Direccion3:', receiverDireccion3Value);
    console.log('Receiver Codigo Postal:', receiverCodigoPostalValue);
    console.log('Receiver Ciudad:', receiverCiudadValue);
    console.log('Receiver Estado:', receiverEstadoValue);
    console.log('Receiver Email:', receiverEmailValue);
    console.log('Receiver Telefono:', receiverTelefonoValue);

    //plannedShippingDateAndTime = getShippingDateTimeBasedOnCurrentTime();
    plannedShippingDateAndTime = getPlannedShippingDateTime(senderFechaInput);

    // INICIO DHL **********************************************************************************

    // Create an array to store the package objects
    const ratesPackages = [];

    // Use a for loop to iterate over each cantidadValue
    for (let i = 0; i < cantidadValue; i++) {
        
        // Create a package object
        const packageObj = {
            weight: pesoValue,
            dimensions: {
                length: longitudValue,
                width: anchoValue,
                height: alturaValue
            }
        };

        // Add the package object to the ratesPackages array
        ratesPackages.push(packageObj);
    }
    console.log('ratesPackages: ', ratesPackages);
    console.log('getMexicoCityDateTimeWithNMinutesAdded( 15 ): ', getMexicoCityDateTimeWithNMinutesAdded( 15 ));
    console.log('getDateTimeForShipping(): ', getDateTimeForShipping());
    console.log('getShippingDateTimeBasedOnCurrentTime(): ', getShippingDateTimeBasedOnCurrentTime());
    
        //
        const ratesOptions = {
            url: dhlBaseUrl+'/rates?strictValidation=false',
            method: 'POST',
            connection_link_name: dhlConnectionLinkName,
            header:[
            {
            key:'Content-Type',
            value:'application/json'
            },
            {
            key:'Accept',
            value:'application/json'
            },
            {
            key:'Accept-Encoding',
            value:'gzip, deflate, br'
            },
            {
            key:'Connection',
            value:'keep-alive'
            }],
            body: {
                mode: 'raw',
                raw: {
                    "customerDetails": {
                        "shipperDetails": {
                            "postalCode": senderCodigoPostalValue,
                            "cityName": senderCiudadValue,
                            "countryCode": "MX",
                            "addressLine1": senderDireccionValue
                        },
                        "receiverDetails": {
                            "postalCode": receiverCodigoPostalValue,
                            "cityName": receiverCiudadValue,
                            "countryCode": "MX",
                            "addressLine1": receiverDireccionValue
                        }
                    },
                    "accounts": [
                        {
                            "typeCode": "shipper",
                            "number": "985524658"
                        }
                    ],
                    
                    "plannedShippingDateAndTime": plannedShippingDateAndTime,
                    "unitOfMeasurement": "metric",
                    "isCustomsDeclarable": false,
                    "requestAllValueAddedServices": false,
                    "returnStandardProductsOnly": false,
                    "nextBusinessDay": false,
                    "packages": ratesPackages
                }
            }
        };
        console.log(' - ratesOptions: ');
        console.log(ratesOptions);

        ZFAPPS.request(ratesOptions).then(ratesAPIResponse => {
            console.log('Rates API Response:', ratesAPIResponse);
            logRequest(ratesOptions, ratesAPIResponse);
            checkDHLResponse(ratesAPIResponse);
            // Handle the response as needed
            const ratesBody = JSON.parse(ratesAPIResponse.data.body);
            console.log('ratesBody: ');
            console.log(ratesBody);
            checkDHLResponseBody(ratesBody);
            checkDHLRatesResponseBody(ratesBody);
            
            //
            // Assuming ratesBody is already defined and contains the JSON structure similar to rate_response.json
            const ratesContainer = document.getElementById("ratesContainer");
            // Iterate over the products array

            ratesBody.products.forEach((product, index) => {
                // Create a Bootstrap card for each product
                const productCard = document.createElement("div");
                productCard.className = "card mb-3";
                let productCardBody = `<div class="card-body">
                <h5 class="card-title">Product ${index + 1}: ${product.productName}</h5>`;
            
                // Iterate over the attributes of each product
                Object.entries(product).forEach(([key, value]) => {
                productCardBody += `<p class="card-text"><strong>${key}:</strong> ${JSON.stringify(value)}</p>`;
                });
            
                productCardBody += `</div>`;
                productCard.innerHTML = productCardBody;
                // Append the product card to the rates container
                ratesContainer.appendChild(productCard);
            });					

            // Iterate over the exchangeRates array
            ratesBody.exchangeRates.forEach((exchangeRate, index) => {
                // Create a Bootstrap card for each exchange rate
                const exchangeRateCard = document.createElement("div");
                exchangeRateCard.className = "card mb-3";
                let exchangeRateCardBody = `<div class="card-body">
                <h5 class="card-title">Exchange Rate ${index + 1}</h5>`;
            
                // Iterate over the attributes of each exchange rate
                Object.entries(exchangeRate).forEach(([key, value]) => {
                exchangeRateCardBody += `<p class="card-text"><strong>${key}:</strong> ${JSON.stringify(value)}</p>`;
                });
            
                exchangeRateCardBody += `</div>`;
                exchangeRateCard.innerHTML = exchangeRateCardBody;
                // Append the exchange rate card to the rates container
                ratesContainer.appendChild(exchangeRateCard);
            });
            //
            //
            //
            const ratesContainerResponse = document.getElementById("ratesContainerResponse");

            ratesBody.products.forEach((product, index) => {
                // Find the price object with priceCurrency equal to MXN
                const priceObj = product.totalPrice.find(price => price.priceCurrency === "MXN");
                const priceValue = priceObj ? priceObj.price : "N/A";
                if (priceValue === 'N/A') {
                    return;
                }
                
                // Extract productName
                const productName = product.productName;

                // Extract and format estimatedDeliveryDateAndTime
                const deliveryDate = new Date(product.deliveryCapabilities.estimatedDeliveryDateAndTime);
                let dayOfWeek = deliveryDate.toLocaleString('default', { weekday: 'long' });
                dayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
                const monthAndDay = deliveryDate.toLocaleString('default', { month: 'long', day: 'numeric' });
                const time = deliveryDate.toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' });
                product.price = priceValue;
                const productJson = btoa(JSON.stringify(product));

                // Create the row for this product
                const row = document.createElement("div");
                row.className = "row justify-content-center mt-4";
                row.innerHTML = `
                    <div class="col-md-3 text-center align-items-center">
                        <h6 id="productNameResp${index}">${productName}</h6>
                        <h6 id="monthAndDayResp${index}">${monthAndDay}</h6>
                        <h6 id="dayOfWeekResp${index}">${dayOfWeek}</h6>
                    </div>
                    <div class="col-md-3 d-flex align-items-center justify-content-center">
                        <h6 id="timeResp${index}">${time}</h6>
                    </div>
                    <div class="col-md-3 d-flex align-items-center justify-content-center">
                        <h6 id="priceResp${index}">MXN <span id="priceSpanResp${index}">${priceValue}</span></h6>
                    </div>
                    <div class="col-md-3 d-flex align-items-center justify-content-center">
                        <button id="selectResp${index}" type="button" class="btn btn-primary" onclick="handleSelect('${productJson}')">Seleccionar</button>
                    </div>
                    </div>
                    </div>
                `;

                // Append the row to the ratesContainerResponse
                ratesContainerResponse.appendChild(row);
            });
            
            
            ratesContainerResponse.style.display = "block";
            const firstStepElements = document.getElementsByClassName("first-step");
            for (let i = 0; i < firstStepElements.length; i++) {
                firstStepElements[i].style.display = "none";
            }

            spinnerWrapper.style.display = 'none';
            //
        }).catch(error => {
            logRequest(ratesOptions, error);
            showRequestErrorToast(error.message, 7000);
        });

        

}



// Function to update selectedPackageIds based on checkbox state
function updateSelectedPackages(checkbox) {
    const packageId = checkbox.value;
    if (checkbox.checked) {
        // Add the packageId to selectedPackageIds if it's not already there
        if (!selectedPackageIds.includes(packageId)) {
            selectedPackageIds.push(packageId);
        }
    } else {
        // Remove the packageId from selectedPackageIds if it's unchecked
        const index = selectedPackageIds.indexOf(packageId);
        if (index > -1) {
            selectedPackageIds.splice(index, 1);
        }
    }
    // For demonstration, log the selected package IDs to the console
    console.log('Selected package IDs:', selectedPackageIds);
}

		
export function hideFirstStepElements() {
    const firstStepElements = document.getElementsByClassName('first-step');
    for (let i = 0; i < firstStepElements.length; i++) {
        firstStepElements[i].style.display = 'none';
    }
}




function handleSelect(product) {
    spinnerWrapper.style.display = 'flex';
    const decodedProduct = atob(product);
    const parsedProduct = JSON.parse(decodedProduct);
    console.log("Decoded product:", parsedProduct);
    console.log("Type of decodedProduct:", typeof parsedProduct);
    
    const productCode = parsedProduct.productCode;
    const localProductCode = parsedProduct.localProductCode;
    // Do something with the productCode and localProductCode
    console.log("Selected productCode:", productCode);
    console.log("Selected localProductCode:", localProductCode);

    // INICIO DHL **********************************************************************************
    // Create an array to store the package objects
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
    
    const shipmentsOptions = {
        url: dhlBaseUrl+dhlUrlComplement+'/shipments?strictValidation=false&bypassPLTError=false&validateDataOnly=false',
            method: "POST" ,
            connection_link_name: dhlConnectionLinkName,
            header:[{
            key:'Content-Type',
            value:'application/json'
            },
            {
            key:'Accept',
            value:'application/json'
            },
            {
            key:'Accept-Encoding',
            value:'gzip, deflate, br'
            },
            {
            key:'Connection',
            value:'keep-alive'
            }],
            body: {
                mode: 'raw',
                raw: {
                        "plannedShippingDateAndTime": plannedShippingDateAndTime,
                        "pickup": {
                            "isRequested": false,
                            "closeTime": "18:00",
                            "location": "reception"
                            
                        },
                        "productCode": productCode,
                        "localProductCode": localProductCode,
                        "accounts": [
                            {
                                "typeCode": "shipper",
                                "number": "985524658"
                            }
                        ],
                        "customerDetails": {
                            "shipperDetails": {
                                "postalAddress": {
                                    "postalCode": senderCodigoPostalValue,
                                    "cityName": senderCiudadValue,
                                    "countryCode": "MX",
                                    "addressLine1": senderDireccionValue,
                                    "addressLine2": senderDireccion2Value,
                                    //"addressLine3": senderDireccion3Value,
                                    "countyName": senderCiudadValue,
                                    "provinceName": senderEstadoValue,
                                    "countryName": "MEXICO"
                                },
                                "contactInformation": {
                                    "email": senderEmailValue,
                                    "phone": senderTelefonoValue,
                                    "companyName": senderEmpresaValue,
                                    "fullName": senderNombreValue
                                },
                                "typeCode": "business"
                            },
                            "receiverDetails": {
                                "postalAddress": {
                                    "postalCode": receiverCodigoPostalValue,
                                    "cityName": receiverCiudadValue,
                                    "countryCode": "MX",
                                    "addressLine1": receiverDireccionValue,
                                    "addressLine2": receiverDireccion2Value,
                                    //"addressLine3": receiverDireccion3Value,
                                    "countyName": receiverCiudadValue,
                                    "provinceName": receiverEstadoValue,
                                    "countryName": "MEXICO"
                                },
                                "contactInformation": {
                                    "email": receiverEmailValue,
                                    "phone": receiverTelefonoValue,
                                    "companyName": receiverEmpresaValue,
                                    "fullName": receiverNombreValue
                                },
                                "typeCode": "direct_consumer"
                            }
                        },
                        "content": {
                            "packages": shipmentsPackages,
                            
                            "isCustomsDeclarable": false,
                            "description": descripcionValue,
                            "incoterm": "DAP",
                            "unitOfMeasurement": "metric"
                        },
                        "estimatedDeliveryDate": {
                            "isRequested": false,
                            "typeCode": "QDDC"
                        }
                    }

            }
            
    };
        
    console.log(' - shipmentsOptions: ');
    console.log(shipmentsOptions);
    ZFAPPS.request(shipmentsOptions).then(function(shipmentsAPIResponse) {
        
        //response Handling
        console.log('Request to DHL shipments: ');
        console.log(shipmentsAPIResponse);
        const shipmentsBody = JSON.parse(shipmentsAPIResponse.data.body);
        console.log('shipmentsBody: ');
        console.log(shipmentsBody);
        checkDHLResponse(shipmentsAPIResponse);
        checkDHLResponseBody(shipmentsBody);
        checkDHLShipmentsResponseBody(shipmentsBody);

        const ratesContainerResponse = document.getElementById('ratesContainerResponse');
        ratesContainerResponse.style.display = 'none';
        shipmentTrackingNumber = shipmentsBody.shipmentTrackingNumber;
        trackingUrl = shipmentsBody.trackingUrl;
        parsedProduct.plannedShippingDateAndTime = plannedShippingDateAndTime;
        displayAndDownloadPDFs(shipmentsBody);
        upsertZohoShipment(shipmentsBody, parsedProduct);
        //
        spinnerWrapper.style.display = 'none';
        //
        ZFAPPS.invoke('REFRESH_DATA', 'salesorder').then(() => { 
            console.log('Refresh salesorder successfully');
        });
        

    }).catch(function(error) {
        showRequestErrorToast(error.message, 7000);
    });
    // FIN DHL **********************************************************************************

}


export function setDateTimeFieldAttributes(input) {
    const inputElement = input; 
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const now = new Date();
    const tenMinutesLater = new Date(now.getTime() + 10 * 60000); // 10 minutes from now
    // Calculate the upper limit for the date and time selection; 8 days from now
   const upperLimit = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000).toLocaleString('en-CA', {
        timeZone: timeZone,
        hour12: false
    }).replace(', ', 'T').slice(0, 16);

    // Format the date and time for the min attribute in "YYYY-MM-DDTHH:MM" format
    const minDateTimeForInput = tenMinutesLater.toLocaleString('en-CA', {
        timeZone: timeZone,
        hour12: false
      }).replace(', ', 'T').slice(0, 16);

    inputElement.setAttribute('min', minDateTimeForInput);
    inputElement.setAttribute('max', upperLimit);
    inputElement.value = minDateTimeForInput;
    
}

function getPlannedShippingDateTime(input) {
    const formattedInputElement = input.value + ':00' + ' GMT' 
        + (new Date().getTimezoneOffset() / 60 < 0 ? '+' : '-') 
        + Math.abs(new Date().getTimezoneOffset() / 60).toString().padStart(2, '0') + ':00';
      console.log('formattedInputElement: ', formattedInputElement);
    return formattedInputElement;
}