


export function displayAndDownloadPDFs(shipment) {
    const pdfContainer = document.getElementById('pdfContainer');
    let headerHTML = `
            <div class="alert alert-secondary d-flex align-items-center mb-4" role="alert">
                <div>
                    <i class="bi-file-earmark-pdf-fill" style="font-size: 1.1rem; color: rgb(10, 10, 10);"></i>
                    &nbsp; <strong>Guía ${shipment.trackingNumber} creada con éxito.</strong>
                </div>
                <div id="auxLabelSuccessMsg"></div>
            </div>
    `;

    // if (shipment.provider === 'paquetexpress') {
    //     headerHTML += `
    //         <div class="mb-3">
    //             <p class="form-text">La etiqueta debería aparecer a continuación. Si no carga, puedes abrirla directamente.</p>
    //             <a href="${shipment.labelsPdfContent[0].content}" target="_blank" class="btn btn-secondary">
    //                 <i class="bi-box-arrow-up-right"></i> Abrir Etiqueta en Nueva Pestaña
    //             </a>
    //         </div>
    //     `;
    // }

    pdfContainer.innerHTML = headerHTML;

    console.log("shipment data: ", shipment);

    shipment?.labelsPdfContent.forEach((doc, index) => {
        console.log("index: ", index);
        console.log("Document content length: ", doc?.contentLenght);
        console.log("Document content: ", doc.content);
        const pdfContent =  `data:application/pdf;base64,${doc.content}`;
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '700px';
        iframe.src = pdfContent;
        pdfContainer.appendChild(iframe);


        //
    });
}


function getMexicoCityDateTimeWithNMinutesAdded(minutesToAdd) {
    // Create a Date object for the current date and time
    const now = new Date();
    // Add N minutes
    now.setMinutes(now.getMinutes() + minutesToAdd);
    // Add one day
    //now.setDate(now.getDate() + 1);
    // Options for formatting the date and time in the desired format
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'America/Mexico_City'
    };
    // Format the date and time
    const formattedDateTime = new Intl.DateTimeFormat('en-US', options).format(now);
    // Split the formatted date and time into date and time components
    const [date, time] = formattedDateTime.split(', ');
    // Ensure the date is in the correct YYYY-MM-DD format
    const [month, day, year] = date.split('/');
    const isoDate = `${year}-${month}-${day}`;
    const isoTime = time.trim();
    // Assuming GMT-6 for Mexico City standard time
    const finalString = `${isoDate}T${isoTime} GMT-06:00`;
    return finalString;
}


//Retrieves the current date and time for shipping purposes.
//Returns: A string representing the current date and time in the format "YYYY-MM-DD HH:MM:SS".
function getDateTimeForShipping() {
    // Create a Date object for the current date and time
    const now = new Date();
    // Add one day
    now.setDate(now.getDate() + 1);
    // Set the time to 9:00 am
    now.setHours(9, 0, 0, 0);
    // Options for formatting the date and time in the desired format
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'America/Mexico_City'
    };
    // Format the date and time
    const formattedDateTime = new Intl.DateTimeFormat('en-US', options).format(now);
    // Split the formatted date and time into date and time components
    const [date, time] = formattedDateTime.split(', ');
    // Ensure the date is in the correct YYYY-MM-DD format
    const [month, day, year] = date.split('/');
    const isoDate = `${year}-${month}-${day}`;
    const isoTime = time.trim();
    // Assuming GMT-6 for Mexico City standard time
    const finalString = `${isoDate}T${isoTime} GMT-06:00`;
    return finalString;

}

function getShippingDateTimeBasedOnCurrentTime() {
    const now = new Date();
    const currentTime = now.getHours() + now.getMinutes() / 60;

    if (currentTime < 17.5) {
        return getMexicoCityDateTimeWithNMinutesAdded(15);
    } else {
        return getDateTimeForShipping();
    }
}