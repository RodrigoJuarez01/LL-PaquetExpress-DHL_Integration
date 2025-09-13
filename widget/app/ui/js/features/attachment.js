function attachPDF(base64File, fileName, endpointUrl) {
    //Base64 to File conversion
    let bstr = atob(base64File);
    let length = bstr.length;
    let u8arr = new Uint8Array(length);

    while (length--) {
        u8arr[length] = bstr.charCodeAt(length);
    }

    FileData = new File([u8arr], fileName, {
        type: "application/pdf"
    });

    const attachmentsOptions = {
        url: endpointUrl,
        method: "POST" ,
        attachments: [{
            key: "attachment",
            value: FileData
        }],
        connection_link_name: inventoryConnectionLinkName
    };
    console.log('attachmentsOptions: ', attachmentsOptions);
    ZFAPPS.request(attachmentsOptions).then(function(attachmentsAPIResponse) {
        console.log(attachmentsAPIResponse);
        const attachmentsBody = JSON.parse(attachmentsAPIResponse.data.body);
        console.log('attachments Body: ');
        console.log(attachmentsBody);
        
    }).catch(function(error) {
        //error Handling
        console.log('error on request to attachments: ');
        console.log(error);
        
    });	

}





function formatPDFFileName(trackingNumber) {
    const date = new Date();
    const options = { 
        year: '2-digit', 
        month: 'long', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' };
    
    const formattedDateTime = date.toLocaleString('es-ES', options)
                            .replace(/, /g, '_')
                            .replace(/[\s]/g, '-')
                            .replace(/-de-|--/g, '-');
    
    const fileName = `DHL_${trackingNumber}_${formattedDateTime}.pdf`;
    return fileName;
}
