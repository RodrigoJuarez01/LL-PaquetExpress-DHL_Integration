import { ShippingService } from "../../../core/services/shipping.service.js";


const elements = {
	trackingNumber: null,
	spinner: null,
	appData: null,
	groupedPackagesByShipment: null,
	shipmentId: null,
	trackingCardsContainer: null,
    trackingEventsContainer: null,
};

// EN: /ui/js/features/tracking-view.js

function renderTrackingTimeline(trackingResult) {
    elements.trackingEventsContainer.innerHTML = ''; 
    let eventsHTML = '';

    // Mueve aquí la lógica del forEach que crea el HTML de cada evento de rastreo
    trackingResult.events.forEach((event, index) => {
        // ... tu lógica para formatear fecha, hora, etc. ...
        const trackingDate = '...';
        const trackingTime = '...';

        eventsHTML += `
            <div class="tracking-item">
                <div class="tracking-icon status-intransit">...</div>
                <div class="tracking-date">
                    <h5>${trackingDate}</h5>
                    <span>${trackingTime}</span>
                </div>
                <div class="tracking-content">
                    <div>${event.description}</div>
                    <span>${event.location}</span>
                </div>
            </div>
        `;
    });
    
    // Pinta la línea de tiempo
    elements.trackingEventsContainer.innerHTML = eventsHTML;
    
    // Muestra el título y el contenedor
    const trackingEventsMessage = document.getElementById('trackingEventsMessage');
    const trackingTitle = document.getElementById('trackingTitle');
    trackingTitle.textContent = `Resultado para Tracking# - ${trackingResult.trackingNumber}`;
    trackingEventsMessage.style.display = 'block';
}


async function handleTrackingButtonClick(thisButton) {

	elements.spinner.style.display = 'flex';

	elements.trackingNumber = thisButton.dataset.trackingNumber;
	console.log('Tracking Number:', trackingNumber);

	try {
		const packages = elements.groupedPackagesByShipment[trackingNumber];

		const packageIds = packages.map(pck => pck.package_id).join(',');
		const pck = packages[0];
		elements.shipmentId = pck.shipment_id;

		//0-5

		const trackingResult = await ShippingService.trackShipment('dhl', trackingNumber);

		

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

			const { success, errorMsg } = ZohoService.markShipmentAsDelivered(shipmentId);

			if (!success) {
				showRequestErrorToast('Update Shipment Error: ' + errorMsg, 7000);
			}
		}

		const lastStatusDiv = document.getElementById(`trackingStatus0`);
		lastStatusDiv.className = 'tracking-icon status-current blinker';



	} catch (error) {
		showRequestErrorToast(error.message, 7000);
	}
	//
}


export function initializeTrackingView(appData) {

	const groupedPackagesByShipment = appData?.data?.groupedPackagesByShipment;

    elements.trackingCardsContainer = document.getElementById('trackingCards');
    elements.trackingEventsContainer = document.getElementById('trackingEvents');
    elements.spinner = document.getElementById('spinnerWrapper');


	let trackingCardsEl = '';

	console.log("groupedPackagesByShipment", groupedPackagesByShipment);

	Object.keys(groupedPackagesByShipment).forEach((trackingNumber, index) => {
		if (trackingNumber == 'notShipped') {
			return;
		}

		console.log("trackingNumber", trackingNumber);
		const packages = groupedPackagesByShipment[trackingNumber];
		let packagesEl = '';


		packages.forEach((pck) => {
			const packageEl = `
											<div class="col-6 mb-4">
												<button type="button" class="btn btn-warning disabled">
													${pck.package_number}
													<span class="badge text-bg-secondary">
														${pck.shipment_number}
													</span>
												</button>
											</div>
									`;

			packagesEl += packageEl;

		});

		const cardEl = `
									<div class="col-6 mb-4" id="trackingCard${index}">
										<div class="card">
											<div class="card-body">
		
												<h5 class="card-title">Tracking# - ${trackingNumber}</h5>
												<p class="card-text">
													Paquetes
												</p>
		
												<div class="row" id="packagesRow${index}">
													${packagesEl}
													
												</div>
		
												<div class="d-grid mb-2">
													<button class="btn btn-primary" type="button" data-tracking-number="${trackingNumber}" id="trackingNumberBtn${index}" onclick="handleTrackingButtonClick(this)">
														Rastrear
													</button>
												</div>
													
											</div>
										</div>
									</div>    
								`;

		trackingCardsEl += cardEl;


	});

	elements.trackingCardsContainer.innerHTML = trackingCardsEl;

}

