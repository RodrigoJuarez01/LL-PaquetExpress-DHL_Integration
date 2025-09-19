//
export function _collectFormData(formElements) {
    const formData = {
        sender: {},
        receiver: {},
        packageInfo: {}
    };

    // Itera sobre los elementos del formulario y extrae sus valores
    for (const key in formElements.sender) {
        formData.sender[key] = formElements.sender[key].value;
    }
    for (const key in formElements.receiver) {
        formData.receiver[key] = formElements.receiver[key].value;
    }
    for (const key in formElements.package) {
        formData.packageInfo[key] = formElements.package[key].value;
    }

    formData.sender.plannedShippingDateAndTime = getPlannedShippingDateTime(formElements.sender.fechaInput);


    return formData;
}

export function hideFirstStepElements() {
    const firstStepElements = document.getElementsByClassName('first-step');
    for (let i = 0; i < firstStepElements.length; i++) {
        firstStepElements[i].style.display = 'none';
    }
}




export function handleRateSelection(event) {
    
     const rateJsonBase64 = button.dataset.rateJson;

    // 3. El resto de tu código es exactamente igual
    spinnerWrapper.style.display = 'flex';
    const decodedProduct = atob(rateJsonBase64);
    const parsedProduct = JSON.parse(decodedProduct);

    console.log("Decoded product:", parsedProduct);
    console.log("Type of decodedProduct:", typeof parsedProduct);const button = event.currentTarget;


    const productCode = parsedProduct.productCode;
    const localProductCode = parsedProduct.localProductCode;
    // Do something with the productCode and localProductCode
    console.log("Selected productCode:", productCode);
    console.log("Selected localProductCode:", localProductCode);





    const ratesContainerResponse = document.getElementById('ratesContainerResponse');
    ratesContainerResponse.style.display = 'none';

    // shipmentTrackingNumber = shipmentsBody.shipmentTrackingNumber;
    // trackingUrl = shipmentsBody.trackingUrl;
    
    parsedProduct.plannedShippingDateAndTime = plannedShippingDateAndTime;
    displayAndDownloadPDFs(shipmentsBody);
    upsertZohoShipment(shipmentsBody, parsedProduct);
    //
    spinnerWrapper.style.display = 'none';
    //
    ZFAPPS.invoke('REFRESH_DATA', 'salesorder').then(() => {
        console.log('Refresh salesorder successfully');
    });


        // showRequestErrorToast(error.message, 7000);
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