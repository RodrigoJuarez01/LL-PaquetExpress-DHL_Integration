// Helper function to show request toast
export function showRequestErrorToast(message, delay) {
    console.log('message: ', message);
    spinnerWrapper.style.display = 'none';
    // Get the toast container
    const toastContainer = document.getElementById('toastContainer');
    
    toastContainer.style.top = `${window.pageYOffset * 1.05}px`;
    
    toastContainer.classList.remove('top-50', 'translate-middle');
    toastContainer.classList.add('bottom-0', 'translate-middle-x');
    const errorToast = document.getElementById('toast');
    errorToast.setAttribute('data-bs-delay', delay);
    const toastBody = errorToast.querySelector('.toast-body');
    toastBody.innerHTML = '<p><strong>'+message+'</strong></p>';
    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(errorToast);
    toastBootstrap.show();
}

//showRequestErrorToast(error.message, 7000);
//checkDHLResponse(ratesAPIResponse);
export function checkDHLResponse(response) {
    const responseData = response.data;
    if(responseData.status_code != 200 && responseData.status_code != 201) {
        let formattedMessage = `${responseData.status_message} - Status: ${responseData.status_code}`;
        if(responseData.body) {
            const responseBody = JSON.parse(responseData.body);
            const title = responseBody.title;
            const message = responseBody.message;
            const detail = responseBody.detail;
            formattedMessage += ` - Title: ${title} - Message: ${message}`;
            if(responseBody.hasOwnProperty('additionalDetails') && 
                responseBody.additionalDetails.length > 0) {
                const additionalDetailsString = responseBody.additionalDetails.join(' - ');
                formattedMessage += ` - Additional Details: ${additionalDetailsString}	`;

            } else {
                formattedMessage += ` - Detail: ${detail}`;
            }
        }
        throw new Error(formattedMessage);
    }
}

export function checkDHLResponseBody(body) {
    if(body.hasOwnProperty('status') && body.hasOwnProperty('title')) {
        let formattedMessage = '';
        const title = body.title;
        const message = body.message;
        const detail = body.detail;
        const status = body.status;
                
        if(status.toString().startsWith('4')) {
            if(detail.includes('996') 
                && status == '404' 
                && title.includes('Product')) {
                    
                formattedMessage = `No se encontraron productos 
                    para la fecha de recolección solicitada. 
                    Por favor, intente con otra fecha u horario. `;

            } else {
                formattedMessage = `Title: ${title} - Message: ${message}
                    Detail ${detail} - Status: ${status}`;
            }
            
            throw new Error(formattedMessage);
        }
    }
}

function checkDHLTrackingResponseBody(body) {
    let formattedMessage = '';
    if(!body.hasOwnProperty('shipments') || body.shipments.length == 0) {

        formattedMessage = 'No se encontraron eventos para el número de guía proporcionado.'
            + ' El elemento "shipments" no existe o está vacío.';
        throw new Error(formattedMessage);

    } else if(!body.shipments[0].hasOwnProperty('events') 
                || body.shipments[0].events.length == 0) {

        formattedMessage = 'No se encontraron eventos para el número de guía proporcionado.'
            + ' El elemento "events" no existe o está vacío.';
        throw new Error(formattedMessage);
    }
}

function checkDHLePODResponseBody(body) {
    let formattedMessage = '';
    if(!body.hasOwnProperty('documents') || body.documents.length == 0) {
        formattedMessage = 'No se encontraron documentos para el número de guía proporcionado.'
            + ' El elemento "documents" no existe o está vacío.';
        throw new Error(formattedMessage);
    }
}

export function checkDHLRatesResponseBody(body) {
    let formattedMessage = '';
    if(!body.hasOwnProperty('products') || body.products.length == 0) {
        formattedMessage = 'No se encontraron productos/servicios.'
            + ' El elemento "products" no existe o está vacío.';
        throw new Error(formattedMessage);
    }
}

function checkDHLShipmentsResponseBody(body) {
    let formattedMessage = '';
    if(!body.hasOwnProperty('documents') || body.documents.length == 0) {
        formattedMessage = 'No se obtuvo la etiqueta.'
            + ' El elemento "documents" no existe o está vacío.';
        throw new Error(formattedMessage);
    }
}