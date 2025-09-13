
function upsertZohoShipment(shipmentsBody, product){
    //4031306000011839495
    //4031306000011839393,4031306000011839495
    const shipmentDate = product.plannedShippingDateAndTime.split('T')[0];
    const notDeliveredPackages = packagesAndWarehouse
        .filter(obj => obj.shipment_id && obj.shipment_number && selectedPackageIds.includes(obj.package_id));
    console.log('notDeliveredPackages: ', notDeliveredPackages);
    
    const packagesWithoutShipment = packagesAndWarehouse
        .filter(obj => !obj.shipment_id && !obj.shipment_number && selectedPackageIds.includes(obj.package_id));
    console.log('packagesWithoutShipment: ', packagesWithoutShipment);

    let notDeliveredPackagesIds = notDeliveredPackages.map(obj => obj.package_id).join(',');
    let packagesWithoutShipmentIds = packagesWithoutShipment.map(obj => obj.package_id).join(',');

    const auxLabelSuccessMsg = document.getElementById('auxLabelSuccessMsg');

    if (notDeliveredPackages.length > 0) {
        //
        const package = notDeliveredPackages[0];console.log('package: ', package);
        const attachmentUrl = 'https://www.zohoapis.com/inventory/v1/shipmentorders/'+package.shipment_id+'/attachment?organization_id='+orgId;
        const updateOptions = {
            url: 'https://www.zohoapis.com/inventory/v1/shipmentorders/'+package.shipment_id+'?organization_id='+orgId+'&package_ids='+notDeliveredPackagesIds+'&salesorder_id='+salesorderId,
              method: "PUT",
              header:[{
                      key: 'Content-Type',
                    value: 'application/json'
              }],
              body: {
                  mode: 'raw',
                  
                  raw: {
                    'date': shipmentDate,
                    'tracking_number': shipmentsBody.shipmentTrackingNumber,
                    'delivery_method': 'DHL',
                    'tracking_link': shipmentsBody.trackingUrl,
                    'shipping_charge': product.price,
                    'service': product.productName+' - '
                    +product.productCode+' - '
                    +product.localProductCode+' - '
                    +product.deliveryCapabilities.estimatedDeliveryDateAndTime,
                    'expected_delivery_date': product
                    .deliveryCapabilities
                    .estimatedDeliveryDateAndTime
                }
              },
              connection_link_name: inventoryConnectionLinkName
        };
          
        ZFAPPS.request(updateOptions).then(function(updateZohoShipmentAPIResponse) {
            //response Handling
            console.log('updateZohoShipment responseJSON: ', updateZohoShipmentAPIResponse);
            const updateShipmentBody = JSON.parse(updateZohoShipmentAPIResponse.data.body);
            console.log('updateShipmentBody: ', updateShipmentBody);
            const shipmentId = updateShipmentBody.shipmentorder.shipment_id;
            const shipmentNumber = updateShipmentBody.shipmentorder.shipment_number;
            attachPDF(shipmentsBody.documents[0].content, formatPDFFileName(shipmentsBody.shipmentTrackingNumber), attachmentUrl);

            const updatedShipmentLink = 'https://inventory.zoho.com/app/'+orgId+'#/salesorders/'+salesorderId+'/shipments/'+shipmentId;

            const auxSuccessMessage = `
                        <strong style="display: block; margin-top: 4px;">
                            &nbsp;Envío actualizado: 
                            <a class="link-opacity-50-hover" href="${updatedShipmentLink}" target="_blank">
                                ${shipmentNumber}
                            </a>
                        </strong>
                    `;
            auxLabelSuccessMsg.innerHTML = auxSuccessMessage;

          }).catch(function(error) {
              //error Handling
              console.log('error on updateZohoShipment: ', error);
              showRequestErrorToast('Update Shipment Error: ' + error.message, 7000);
          }); 
    }

    if (packagesWithoutShipment.length > 0) {
        const package = packagesWithoutShipment[0];
        console.log('expected_delivery_date: ', product
            .deliveryCapabilities
            .estimatedDeliveryDateAndTime.split('T')[0]);
        //
        const createOptions = {
            url: 'https://www.zohoapis.com/inventory/v1/shipmentorders?organization_id='+orgId + '&package_ids='+packagesWithoutShipmentIds+'&salesorder_id='+salesorderId,
              method: "POST",
              header:[{
                      key: 'Content-Type',
                    value: 'application/json'
              }],
              body: {
                  mode: 'raw',
                  
                  raw: {
                    //'shipment_number': 'SHP-DHL'+shipmentsBody.shipmentTrackingNumber+'-'+shipmentsBody.shipmentTrackingNumber,
                    //'date': `${new Date().toISOString().split('T')[0]}`,
                    'date': shipmentDate,
                    'tracking_number': shipmentsBody.shipmentTrackingNumber,
                    'delivery_method': 'DHL',
                    'tracking_link': shipmentsBody.trackingUrl,
                    'shipping_charge': product.price,
                    'service': product.productName+' - '
                    +product.productCode+' - '
                    +product.localProductCode+' - '
                    +product.deliveryCapabilities.estimatedDeliveryDateAndTime,
                    'expected_delivery_date': product
                    .deliveryCapabilities
                    .estimatedDeliveryDateAndTime
                }
              },
              connection_link_name: inventoryConnectionLinkName
          };
          console.log('createOptions: ', createOptions);
          ZFAPPS.request(createOptions).then(function(createZohoShipmentAPIResponse) {
                //response Handling
                console.log('createZohoShipment responseJSON: ', createZohoShipmentAPIResponse);
                const createShipmentBody = JSON.parse(createZohoShipmentAPIResponse.data.body);
                console.log('createShipmentBody: ', createShipmentBody);
                const shipmentId = createShipmentBody.shipmentorder.shipment_id;
                const shipmentNumber = createShipmentBody.shipmentorder.shipment_number;
                const attachmentUrl = 'https://www.zohoapis.com/inventory/v1/shipmentorders/'+shipmentId+'/attachment?organization_id='+orgId;
                console.log('attachmentUrl: ', attachmentUrl);
                attachPDF(shipmentsBody.documents[0].content, formatPDFFileName(shipmentsBody.shipmentTrackingNumber), attachmentUrl);
                const createdShipmentLink = 'https://inventory.zoho.com/app/'+orgId+'#/salesorders/'+salesorderId+'/shipments/'+shipmentId;

                const auxSuccessMessage = `
                        <strong style="display: block; margin-top: 4px;">
                            &nbsp;Envío creado: 
                            <a class="link-opacity-50-hover" href="${createdShipmentLink}" target="_blank">
                                ${shipmentNumber}
                            </a>
                        </strong>
                    `;
                auxLabelSuccessMsg.innerHTML = auxSuccessMessage;

          }).catch(function(error) {
              //error Handling
              console.log('error on createZohoShipment: ', error);
              showRequestErrorToast('Create Shipment Error: ' + error.message, 7000);
          }); 

    }

    

}


function displayAndDownloadPDFs(shipmentsBody) {
    const pdfContainer = document.getElementById('pdfContainer');
    const successMessage = `
            <div class="alert alert-secondary d-flex align-items-center mb-4" role="alert">
                <div>
                    <i class="bi-file-earmark-pdf-fill" style="font-size: 1.1rem; color: rgb(10, 10, 10);"></i>
                    &nbsp; <strong>La guía fue generada correctamente.</strong>
                </div>
                <div id="auxLabelSuccessMsg"></div>
            </div>
    `;
    pdfContainer.innerHTML = successMessage;
    console.log("shipmentsBody.documents.size(): ", shipmentsBody.documents.length);
    console.log("shipmentsBody.documents: ", shipmentsBody.documents);
    shipmentsBody.documents.forEach((doc, index) => {
        console.log("index: ", index);
        console.log("Document content length: ", doc.content.length);
        console.log("Document content: ", doc.content);
        const pdfContent = `data:application/pdf;base64,${doc.content}`;
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '700px';
        iframe.src = pdfContent;
        pdfContainer.appendChild(iframe);


        //
    });
}


function getMexicoCityDateTimeWithNMinutesAdded( minutesToAdd ) {
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