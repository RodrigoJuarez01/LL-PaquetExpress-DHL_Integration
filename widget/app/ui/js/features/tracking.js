
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
        url: dhlBaseUrl+'/tracking',
        method: "GET" ,
        connection_link_name: dhlConnectionLinkName,
        url_query: [{
            key: 'shipmentTrackingNumber',
            value: auxTrackingNumber
        },{
            key: 'trackingView',
            value: 'all-checkpoints'
        },
        {
            key: 'levelOfDetail',
            value: 'shipment'
        }],
        header:[{
                key:'Accept',
                value:'*/*'
            },
            {
                key:'Accept-Encoding',
                value:'gzip, deflate, br'
            },
            {
                key:'Connection',
                value:'keep-alive'
        }]
    };
        
    console.log('Tracking Options:', trackingOptions);
    ZFAPPS.request(trackingOptions).then(function(trackingAPIResponse) {
        console.log('Tracking API Response:', trackingAPIResponse);
        checkDHLResponse(trackingAPIResponse);
        // Handle the response as needed
        const trackingBodyArray = JSON.parse(trackingAPIResponse.data.body);
        console.log('trackingBodyArray: ', trackingBodyArray);
        
        const trackingTitle = document.getElementById('trackingTitle');
        trackingTitle.textContent = 'Resultado para Tracking# - '+trackingNumber;


        /*
        const trackingBodyArray = {
            "shipments": [
                {
                    "shipmentTrackingNumber": "9356579890",
                    "status": "Success",
                    "shipmentTimestamp": "2024-03-31T21:33:19",
                    "productCode": "P",
                    "description": "Sunglasses",
                    "shipperDetails": {
                        "name": "",
                        "postalAddress": {
                            "cityName": "",
                            "postalCode": "",
                            "countryCode": "AU"
                        },
                        "serviceArea": [
                            {
                                "code": "SYD",
                                "description": "Sydney-AU"
                            }
                        ]
                    },
                    "receiverDetails": {
                        "name": "",
                        "postalAddress": {
                            "cityName": "",
                            "postalCode": "",
                            "countryCode": "DE"
                        },
                        "serviceArea": [
                            {
                                "code": "QFB",
                                "description": "Freiburg-DE",
                                "facilityCode": "QFB"
                            }
                        ]
                    },
                    "totalWeight": 0.58,
                    "unitOfMeasurements": "metric",
                    "shipperReferences": [
                        {
                            "value": "PMUS200195612",
                            "typeCode": "CU"
                        }
                    ],
                    "events": [
                        {
                            "date": "2024-04-02",
                            "time": "09:01:19",
                            "typeCode": "PU",
                            "description": "Shipment picked up",
                            "serviceArea": [
                                {
                                    "code": "SYD",
                                    "description": "Sydney-AU"
                                }
                            ]
                        },
                        {
                            "date": "2024-04-02",
                            "time": "18:22:04",
                            "typeCode": "AF",
                            "description": "Arrived at DHL Sort Facility  SYDNEY-AUSTRALIA",
                            "serviceArea": [
                                {
                                    "code": "SYD",
                                    "description": "Sydney-AU"
                                }
                            ]
                        },
                        {
                            "date": "2024-04-02",
                            "time": "18:30:20",
                            "typeCode": "PL",
                            "description": "Processed at SYDNEY-AUSTRALIA",
                            "serviceArea": [
                                {
                                    "code": "SYD",
                                    "description": "Sydney-AU"
                                }
                            ]
                        },
                        {
                            "date": "2024-04-02",
                            "time": "20:07:58",
                            "typeCode": "DF",
                            "description": "Shipment has departed from a DHL facility SYDNEY-AUSTRALIA",
                            "serviceArea": [
                                {
                                    "code": "SYD",
                                    "description": "Sydney-AU"
                                }
                            ]
                        },
                        {
                            "date": "2024-04-03",
                            "time": "04:39:01",
                            "typeCode": "AF",
                            "description": "Arrived at DHL Sort Facility  SINGAPORE-SINGAPORE",
                            "serviceArea": [
                                {
                                    "code": "SIN",
                                    "description": "Singapore-SG"
                                }
                            ]
                        },
                        {
                            "date": "2024-04-03",
                            "time": "07:49:39",
                            "typeCode": "PL",
                            "description": "Processed at SINGAPORE-SINGAPORE",
                            "serviceArea": [
                                {
                                    "code": "SIN",
                                    "description": "Singapore-SG"
                                }
                            ]
                        },
                        {
                            "date": "2024-04-04",
                            "time": "03:32:58",
                            "typeCode": "DF",
                            "description": "Shipment has departed from a DHL facility SINGAPORE-SINGAPORE",
                            "serviceArea": [
                                {
                                    "code": "SIN",
                                    "description": "Singapore-SG"
                                }
                            ]
                        },
                        {
                            "date": "2024-04-04",
                            "time": "13:01:47",
                            "typeCode": "TR",
                            "description": "Shipment is in transit to destination",
                            "serviceArea": [
                                {
                                    "code": "BAH",
                                    "description": "Bahrain-BH"
                                }
                            ]
                        },
                        {
                            "date": "2024-04-04",
                            "time": "21:21:58",
                            "typeCode": "DF",
                            "description": "Shipment has departed from a DHL facility BAHRAIN-BAHRAIN",
                            "serviceArea": [
                                {
                                    "code": "BAH",
                                    "description": "Bahrain-BH"
                                }
                            ]
                        },
                        {
                            "date": "2024-04-04",
                            "time": "20:26:04",
                            "typeCode": "RR",
                            "description": "Customs clearance status updated. Note - The Customs clearance process may start while the shipment is in transit to the destination. ",
                            "serviceArea": [
                                {
                                    "code": "LEJ",
                                    "description": "Leipzig-DE"
                                }
                            ]
                        },
                        {
                            "date": "2024-04-05",
                            "time": "03:54:47",
                            "typeCode": "AF",
                            "description": "Arrived at DHL Sort Facility  LEIPZIG-GERMANY",
                            "serviceArea": [
                                {
                                    "code": "LEJ",
                                    "description": "Leipzig-DE"
                                }
                            ]
                        },
                        {
                            "date": "2024-04-05",
                            "time": "04:34:59",
                            "typeCode": "IC",
                            "description": "Processed for clearance at LEIPZIG-GERMANY",
                            "serviceArea": [
                                {
                                    "code": "LEJ",
                                    "description": "Leipzig-DE"
                                }
                            ]
                        },
                        {
                            "date": "2024-04-05",
                            "time": "04:35:40",
                            "typeCode": "RR",
                            "description": "Customs clearance status updated. Note - The Customs clearance process may start while the shipment is in transit to the destination. ",
                            "serviceArea": [
                                {
                                    "code": "LEJ",
                                    "description": "Leipzig-DE"
                                }
                            ]
                        },
                        {
                            "date": "2024-04-05",
                            "time": "04:35:46",
                            "typeCode": "CR",
                            "description": "Clearance processing complete at LEIPZIG-GERMANY",
                            "serviceArea": [
                                {
                                    "code": "LEJ",
                                    "description": "Leipzig-DE"
                                }
                            ]
                        },
                        {
                            "date": "2024-04-05",
                            "time": "04:48:46",
                            "typeCode": "PL",
                            "description": "Processed at LEIPZIG-GERMANY",
                            "serviceArea": [
                                {
                                    "code": "LEJ",
                                    "description": "Leipzig-DE"
                                }
                            ]
                        },
                        {
                            "date": "2024-04-05",
                            "time": "09:33:04",
                            "typeCode": "PY",
                            "description": "Payment is received and recorded for shipment related fees",
                            "serviceArea": [
                                {
                                    "code": "QFB",
                                    "description": "Freiburg-DE"
                                }
                            ]
                        },
                        {
                            "date": "2024-04-05",
                            "time": "10:32:46",
                            "typeCode": "OH",
                            "description": "Shipment is on hold",
                            "serviceArea": [
                                {
                                    "code": "LEJ",
                                    "description": "Leipzig-DE"
                                }
                            ]
                        },
                        {
                            "date": "2024-04-07",
                            "time": "18:41:20",
                            "typeCode": "DF",
                            "description": "Shipment has departed from a DHL facility LEIPZIG-GERMANY",
                            "serviceArea": [
                                {
                                    "code": "LEJ",
                                    "description": "Leipzig-DE"
                                }
                            ]
                        },
                        {
                            "date": "2024-04-08",
                            "time": "05:27:12",
                            "typeCode": "AR",
                            "description": "Arrived at DHL Delivery Facility  FREIBURG-GERMANY",
                            "serviceArea": [
                                {
                                    "code": "QFB",
                                    "description": "Freiburg-DE"
                                }
                            ]
                        },
                        {
                            "date": "2024-04-08",
                            "time": "07:35:19",
                            "typeCode": "WC",
                            "description": "Shipment is out with courier for delivery",
                            "serviceArea": [
                                {
                                    "code": "QFB",
                                    "description": "Freiburg-DE"
                                }
                            ]
                        },
                        {
                            "date": "2024-04-08",
                            "time": "09:47:26",
                            "typeCode": "NH",
                            "description": "Delivery attempted but no response at Consignee address",
                            "serviceArea": [
                                {
                                    "code": "QFB",
                                    "description": "Freiburg-DE"
                                }
                            ]
                        },
                        {
                            "date": "2024-04-08",
                            "time": "10:53:45",
                            "typeCode": "CC",
                            "description": "Awaiting collection by the consignee",
                            "serviceArea": [
                                {
                                    "code": "QFB",
                                    "description": "Freiburg-DE"
                                }
                            ]
                        },
                        {
                            "date": "2024-04-08",
                            "time": "14:39:43",
                            "typeCode": "OK",
                            "description": "Delivered",
                            "serviceArea": [
                                {
                                    "code": "QFB",
                                    "description": "Freiburg-DE"
                                }
                            ],
                            "signedBy": ""
                        }
                    ],
                    "numberOfPieces": 1
                }
            ]
        };
        */

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
                url: 'https://www.zohoapis.com/inventory/v1/shipmentorders/'+shipmentId+'/status/delivered?organization_id='+orgId,
                  method: "POST",
                  header:[{
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
            ZFAPPS.request(updateOptions).then(function(updateZohoShipmentAPIResponse) {
                //response Handling
                console.log('shipmentorders responseJSON: ', updateZohoShipmentAPIResponse);
                console.log('shipmentorders responseJSON.data.body: ', updateZohoShipmentAPIResponse.data.body);
            }).catch(function(error) {
                //error Handling
                console.log('error on updateZohoShipment: ', error);
                showRequestErrorToast('Update Shipment Error: ' + error.message, 7000);
            });

        }
        
        // Updating the class of the last event icon
        const lastStatusDiv = document.getElementById(`trackingStatus0`);
        lastStatusDiv.className = 'tracking-icon status-current blinker';





    }).catch(function(error) {
        showRequestErrorToast(error.message, 7000);
        
    });
    //

}
