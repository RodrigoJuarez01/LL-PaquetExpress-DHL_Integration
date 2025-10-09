import { ShippingService } from "../../../core/services/shipping.service.js";
import { showRequestErrorToast } from "../features/errorToast.js";


const elements = {
	trackingNumber: null,
	spinner: null,
	appData: null,
	groupedPackagesByShipment: null,
	shipmentId: null,
	trackingCardsContainer: null,
	trackingEventsContainer: null,
};


function renderTrackingTimeline(trackingResult) {
	elements.trackingEventsContainer.innerHTML = '';
	let eventsHTML = '';

	trackingResult.events.forEach((event, index) => {

		const trackingDayOfWeek = new Date(event.date)
			.toLocaleDateString('es-MX', { weekday: 'long', timeZone: 'UTC' })
			.charAt(0).toUpperCase() + new Date(event.date)
				.toLocaleDateString('es-MX', { weekday: 'long', timeZone: 'UTC' })
				.slice(1);

		let trackingDate = event.date.split('-')[2].replace(/^0+/, '') + ' ' + new Date(event.date).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }).replace(/ de /g, ' ');
		console.log('Tracking Date:', trackingDate);
		console.log('event.date:', event.date);
		trackingDate = trackingDate.replace(/\b\w/g, (c) => c.toUpperCase());

		const trackingTime = event.time;
		const trackingDescription = event.description;
		const trackingServiceAreaDesc = event.location;
		const trackingNumOfPieces = trackingResult.summary.numberOfPieces === 1 ? "1 Pieza" : `${trackingResult.summary.numberOfPieces} Piezas`;


		eventsHTML += `
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
	});

	elements.trackingEventsContainer.innerHTML = eventsHTML;

	const trackingEventsMessage = document.getElementById('trackingEventsMessage');
	const trackingTitle = document.getElementById('trackingTitle');
	trackingTitle.textContent = `Resultado para Tracking# - ${trackingResult.trackingNumber}`;
	trackingEventsMessage.style.display = 'block';

	elements.spinner.style.display = 'none';
}


async function handleTrackingButtonClick(event) {

	elements.spinner.style.display = 'flex';

	// console.log("thisButton.dataset", thisButton);

	const button = event.currentTarget; 

	elements.trackingNumber = button.dataset.trackingNumber;;
	elements.shipmentId = button.dataset.shipmentId;;
	console.log('Tracking Number:', elements.trackingNumber );
	console.log('Shipment id:', elements.shipmentId );

	// try {
		const packages = elements.groupedPackagesByShipment[elements.trackingNumber];

		const packageIds = packages.map(pck => pck.package_id).join(',');
		const pck = packages[0];
		elements.shipmentId = pck.shipment_id;

		const trackingResult = await ShippingService.trackShipment('dhl', elements.trackingNumber);

		renderTrackingTimeline(trackingResult);


		const lastEvent = trackingResult.events[0];
		console.log('Last Event:', lastEvent);


		if (lastEvent.typeCode !== "OK") {
			const pendingRowHTML = `
                <div class="tracking-item-pending" id="pendingTrackingEvent">
                    
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
			elements.trackingEventsContainer.insertAdjacentHTML('afterbegin', pendingRowHTML);

		} else {

			const { success, errorMsg } = ZohoService.markShipmentAsDelivered(shipmentId);

			if (!success) {
				showRequestErrorToast('Update Shipment Error: ' + errorMsg, 7000);
			}
		}

		// const lastStatusDiv = document.getElementById(`trackingStatus0`);
		// lastStatusDiv.className = 'tracking-icon status-current blinker';

		const firstIcon = document.querySelector('.js-tracking-icon');
		if (firstIcon) {
			firstIcon.classList.add('status-current', 'blinker');
		}

	// } catch (error) {
	// 	showRequestErrorToast(error.message, 7000);
	// }
	//
}


function setupTrackingButtonListeners(appData) {
    const trackButtons = document.querySelectorAll('.js-track-btn');
    trackButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            handleTrackingButtonClick(event, appData);
        });
    });
}

function renderTrackingCards(groupedPackages) {
	let trackingCardsEl = '';

	console.log("groupedPackages", groupedPackages);

	Object.keys(groupedPackages).forEach((trackingNumber, index) => {
		if (trackingNumber == 'notShipped') {
			return;
		}

		console.log("trackingNumber", trackingNumber);
		const packages = groupedPackages[trackingNumber];
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
							<button class="btn btn-primary js-track-btn" type="button" data-tracking-number="${trackingNumber}" id="trackingNumberBtn${index}" data-shipment-id="${packages[0].shipment_id}">
								Rastrear
							</button>
						</div>
							
					</div>
				</div>
			</div>    
		`;

		trackingCardsEl += cardEl;


	});

	return trackingCardsEl;
}


export function initializeTrackingView(appData) {


	elements.trackingCardsContainer = document.getElementById('trackingCards');
	elements.trackingEventsContainer = document.getElementById('trackingEvents');
	elements.spinner = document.getElementById('spinnerWrapper');
	elements.groupedPackagesByShipment = appData.data.groupedPackagesByShipment;

	const trackingCardsHTML = renderTrackingCards(appData.data.groupedPackagesByShipment);



	elements.trackingCardsContainer.innerHTML = trackingCardsHTML;

	
	setupTrackingButtonListeners();

}
