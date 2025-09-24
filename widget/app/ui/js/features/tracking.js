
function handleTrackingButtonClick(thisButton) {
    spinnerWrapper.style.display = 'flex';
    const trackingNumber = thisButton.dataset.trackingNumber;
    console.log('Tracking Number:', trackingNumber);
    const packages = groupedPackagesByShipment[trackingNumber];
    const packageIds = packages.map(package => package.package_id).join(',');
    const package = packages[0];
    const shipmentId = package.shipment_id;

    //0-5
    const tNumbersForTesting = ['2775523063', '3660208860', '7661769404', '7349581960', '4540441264', '9356579890'];

    const auxTrackingNumber = orgId == '808492068' ? tNumbersForTesting[3] : trackingNumber;
    console.log('auxTrackingNumber:', auxTrackingNumber);

    //
    const trackingOptions = {
        url: dhlBaseUrl + '/tracking',
        method: "GET",
        connection_link_name: dhlConnectionLinkName,
        url_query: [{
            key: 'shipmentTrackingNumber',
            value: auxTrackingNumber
        }, {
            key: 'trackingView',
            value: 'all-checkpoints'
        },
        {
            key: 'levelOfDetail',
            value: 'shipment'
        }],
        header: [{
            key: 'Accept',
            value: '*/*'
        },
        {
            key: 'Accept-Encoding',
            value: 'gzip, deflate, br'
        },
        {
            key: 'Connection',
            value: 'keep-alive'
        }]
    };

    console.log('Tracking Options:', trackingOptions);
    ZFAPPS.request(trackingOptions).then(function (trackingAPIResponse) {
        console.log('Tracking API Response:', trackingAPIResponse);
        checkDHLResponse(trackingAPIResponse);
        // Handle the response as needed
        const trackingBodyArray = JSON.parse(trackingAPIResponse.data.body);
        console.log('trackingBodyArray: ', trackingBodyArray);

        const trackingTitle = document.getElementById('trackingTitle');
        trackingTitle.textContent = 'Resultado para Tracking# - ' + trackingNumber;




        checkDHLTrackingResponseBody(trackingBodyArray);
        console.log('trackingBodyArray: ');
        console.log(trackingBodyArray);


        //
        const trackingBody = trackingBodyArray.shipments[0];
        const eventsContainer = document.getElementById('trackingEvents');
        eventsContainer.innerHTML = '';
        const trackingEventsMessage = document.getElementById('trackingEventsMessage');
        trackingEventsMessage.style.display = 'block';
        trackingBody.events.sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));
        trackingBody.events.forEach((event, index) => {

            //const trackingDayOfWeek = new Date(event.date).toLocaleDateString('es-MX', { weekday: 'long' }).charAt(0).toUpperCase() + new Date(event.date).toLocaleDateString('es-MX', { weekday: 'long' }).slice(1);
            const trackingDayOfWeek = new Date(event.date)
                .toLocaleDateString('es-MX', { weekday: 'long', timeZone: 'UTC' })
                .charAt(0).toUpperCase() + new Date(event.date)
                    .toLocaleDateString('es-MX', { weekday: 'long', timeZone: 'UTC' })
                    .slice(1);
            //let trackingDate = new Date(event.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' }).replace(/ de /g, ' ');
            let trackingDate = event.date.split('-')[2].replace(/^0+/, '') + ' ' + new Date(event.date).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }).replace(/ de /g, ' ');
            console.log('Tracking Date:', trackingDate);
            console.log('event.date:', event.date);
            trackingDate = trackingDate.replace(/\b\w/g, (c) => c.toUpperCase());
            const trackingTime = event.time.slice(0, 5);
            const trackingDescription = event.description;
            const trackingServiceAreaDesc = event.serviceArea[0].description;
            //const trackingNumOfPieces = trackingBody.numberOfPieces;
            const trackingNumOfPieces = trackingBody.numberOfPieces === 1 ? "1 Pieza" : `${trackingBody.numberOfPieces} Piezas`;

            //Create the row for this event
            const row = document.createElement("div");
            row.className = "tracking-item";
            row.id = `trackingEventRow${index}`;
            row.innerHTML = `
                
                    <div class="tracking-icon status-intransit" id="trackingStatus${index}">
                        <svg class="svg-inline--fa fa-circle fa-w-16" aria-hidden="true" data-prefix="fas" data-icon="circle" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" data-fa-i2svg="">
                        <path fill="currentColor" d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z"></path>
                        </svg>
                    </div>
                    <div class="tracking-date">
                        <span id="trackingDayOfWeek${index}">
                            ${trackingDayOfWeek}
                        </span>
                        <h5 id="trackingDate${index}">${trackingDate}</h5>
                        
                        <span id="trackingTime${index}">
                            ${trackingTime}
                        </span>
                    </div>
                    <div class="tracking-content">
                        <div id="trackingDescription${index}">${trackingDescription}</div>
                        <span id="trackingServiceAreaDesc${index}">${trackingServiceAreaDesc}</span>
                        <span id="trackingNumOfPieces${index}">${trackingNumOfPieces}</span>

                    </div>
                
            `;
            eventsContainer.appendChild(row);

            spinnerWrapper.style.display = 'none';




        });

        const lastEvent = trackingBody.events[0];
        console.log('Last Event:', lastEvent);


        if (lastEvent.typeCode !== "OK") {
            //Create the row for this event
            const row = document.createElement("div");
            row.className = "tracking-item-pending";
            row.id = `pendingTrackingEvent`;
            row.innerHTML = `
                
                    
                        <div class="tracking-icon status-intransit">
                            <svg class="svg-inline--fa fa-circle fa-w-16" aria-hidden="true" data-prefix="fas" data-icon="circle" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" data-fa-i2svg="">
                            <path fill="currentColor" d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z"></path>
                            </svg>
                        </div>
                        <div class="tracking-date">
                        &nbsp; 
                        </div>
                        <div class="tracking-content">
                            Actividad de rastreo pendiente
                        </div>
                    
                
            `;
            eventsContainer.prepend(row);

        } else {

            const updateOptions = {
                url: 'https://www.zohoapis.com/inventory/v1/shipmentorders/' + shipmentId + '/status/delivered?organization_id=' + orgId,
                method: "POST",
                header: [{
                    key: 'Content-Type',
                    value: 'application/json'
                }],
                body: {
                    mode: 'raw',
                    raw: {

                    }
                },
                connection_link_name: inventoryConnectionLinkName
            };
            console.log('updateOptions: ', updateOptions);
            console.log('updateOptions.body: ', updateOptions.body);
            ZFAPPS.request(updateOptions).then(function (updateZohoShipmentAPIResponse) {
                //response Handling
                console.log('shipmentorders responseJSON: ', updateZohoShipmentAPIResponse);
                console.log('shipmentorders responseJSON.data.body: ', updateZohoShipmentAPIResponse.data.body);
            }).catch(function (error) {
                //error Handling
                console.log('error on updateZohoShipment: ', error);
                showRequestErrorToast('Update Shipment Error: ' + error.message, 7000);
            });

        }

        // Updating the class of the last event icon
        const lastStatusDiv = document.getElementById(`trackingStatus0`);
        lastStatusDiv.className = 'tracking-icon status-current blinker';





    }).catch(function (error) {
        showRequestErrorToast(error.message, 7000);

    });
    //

}
