import { ShippingService } from "../../../core/services/shipping.service.js";
import { showRequestErrorToast } from "../features/errorToast.js";
import ZohoService from '../../../core/services/zoho.service.js';


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
		const trackingNumOfPieces = !trackingResult.summary.numberOfPieces ? "" : trackingResult.summary.numberOfPieces === 1 ? "1 Pieza" : `${trackingResult.summary.numberOfPieces} Piezas`;


		const isCurrentClass = (index === 0) ? 'is-current' : '';

		eventsHTML += `
            <div class="tracking-item ${isCurrentClass}">
                
                <div class="tracking-icon"></div>
                
                <div class="tracking-date">
                    <span class="day-of-week">${trackingDayOfWeek}</span>
                    <h5>${trackingDate}</h5>
                    <span class="time">${trackingTime}</span>
                </div>
                
                <div class="tracking-content">
                    <div>${event.description}</div>
                    <span class="location">${event.location}</span>
                </div>

            </div>
        `;
	});

	elements.trackingEventsContainer.innerHTML = eventsHTML;

	const trackingTitle = document.getElementById('trackingTitle');
	if (trackingTitle) {
		trackingTitle.textContent = `Historial para ${trackingResult.trackingNumber}`;
	};
}

function setupConfirmCancelListeners() {
	const confirmButton = document.querySelector('.js-confirm-cancel-btn');
	if (confirmButton) {
		confirmButton.onclick = executeCancelation; // Llama a la lógica final
	}

	const resetButton = document.querySelector('.js-reset-cancel-btn');
	if (resetButton) {
		resetButton.onclick = resetCancelButton; // Llama al reseteo
	}
}


async function executeCancelation(event) {
	const confirmButton = event.currentTarget;
	const trackingNumber = confirmButton.dataset.trackingNumber;
	const shipmentId = confirmButton.dataset.shipmentId;
	const container = confirmButton.parentElement; // El .btn-group

	// Fija el ancho para que no "brinque" con el spinner
	const alertContainer = document.getElementById('tracking-alert-container');
	alertContainer.innerHTML = ''; // Limpia alertas viejas

	container.style.minWidth = container.offsetWidth + 'px';
	container.style.justifyContent = 'center'; // Centra el spinner

	// Muestra el spinner
	container.innerHTML = `
        <span class="spinner-grow spinner-grow-sm text-danger" role="status">
            <span class="visually-hidden">Cancelando...</span>
        </span>
    `;

	try {

		await ShippingService.cancelShipment('paquetexpress', trackingNumber);
		
		const zohoDeleteResult = await ZohoService.deleteShipment(shipmentId);

		
		if (!zohoDeleteResult.success) {
			console.warn(`Guía ${trackingNumber} cancelada en PQX, pero no se pudo borrar de Zoho: ${zohoDeleteResult.errorMsg}`);
		}


		alertContainer.innerHTML = `
            <div class="alert alert-success">
                <i class="bi-check-circle-fill me-2"></i>
                ¡Envío <strong>${trackingNumber}</strong> cancelado con éxito!
            </div>
        `;

		document.getElementById('tracking-actions-container').innerHTML = ''; // Borra el spinner
		document.getElementById('trackingTitle').textContent = `Envío Cancelado: ${trackingNumber}`;
		elements.trackingEventsContainer.innerHTML = '<p class="text-danger fs-5">Este envío ha sido cancelado.</p>';

	} catch (error) {

		alertContainer.innerHTML = `
            <div class="alert alert-danger">
                <i class="bi-exclamation-triangle-fill me-2"></i>
                Error: ${error.message}
            </div>
        `;

		const container = document.getElementById('tracking-actions-container');
		container.style.minWidth = null; // Resetea el ancho
		container.innerHTML = `
            <button class="btn btn-sm btn-outline-danger js-cancel-shipment-btn" 
                    data-tracking-number="${trackingNumber}"
                    data-shipment-id="${shipmentId}">
                <i class="bi-trash me-1"></i> Cancelar Envío
            </button>
        `;
	}
}

function resetCancelButton(event) {
	const button = event.currentTarget || event;

	const trackingNumber = button.dataset.trackingNumber;
	const shipmentId = button.dataset.shipmentId;
	const container = button.closest('#tracking-actions-container');

	container.innerHTML = `
        <button class="btn btn-sm btn-outline-danger js-cancel-shipment-btn" 
                data-tracking-number="${trackingNumber}"
                data-shipment-id="${shipmentId}">
            <i class="bi-trash me-1"></i> Cancelar Envío
        </button>
    `;

	setupCancelButtonListener();
}

function showCancelConfirmation(event) {
	const button = event.currentTarget;
	const trackingNumber = button.dataset.trackingNumber;
	const shipmentId = button.dataset.shipmentId;
	const container = button.parentElement; // El div 'tracking-actions-container'

	// 1. Reemplaza el botón por el grupo "Confirmar/Volver"
	container.innerHTML = `
        <div class="btn-group btn-group-sm" role="group">
            <button type="button" class="btn btn-danger js-confirm-cancel-btn" 
                    data-tracking-number="${trackingNumber}" 
                    data-shipment-id="${shipmentId}">
                <strong>¿Confirmar?</strong>
            </button>
            <button type="button" class="btn btn-secondary js-reset-cancel-btn"
                    data-tracking-number="${trackingNumber}" 
                    data-shipment-id="${shipmentId}">
                Volver
            </button>
        </div>
    `;

	// 2. ¡IMPORTANTE! Acabamos de crear botones nuevos.
	//    Debemos asignarles sus listeners AHORA.
	setupConfirmCancelListeners();
}

function setupCancelButtonListener() {
	const cancelButton = document.querySelector('.js-cancel-shipment-btn');
	if (cancelButton) {
		// Usamos '.onclick' para asegurarnos de que solo haya un listener
		cancelButton.onclick = showCancelConfirmation;
	}
}

function checkCanCancel(shippingDateStr) {
	if (!shippingDateStr) return false;

	const shippingDate = new Date(`${shippingDateStr}T00:00:00-06:00`);

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	return today <= shippingDate;
}

async function handleTrackingCardClick(card) {

	elements.trackingSpinner.classList.remove('d-none');
	elements.trackingEventsContainer.innerHTML = '';
	elements.trackingPlaceholder.classList.add('d-none');

	const trackingNumber = card.dataset.trackingNumber;
	const shipmentId = card.dataset.shipmentId;
	const provider = card.dataset.provider;
	const shippingDateStr = card.dataset.shippingDate;
	// elements.shipmentId = pck.shipment_id;

	const actionsContainer = document.getElementById('tracking-actions-container');
	actionsContainer.innerHTML = '';

	const canCancel = checkCanCancel(shippingDateStr);

	if (provider === 'paquetexpress' && canCancel) {
		const cancelButtonHTML = `
            <button class="btn btn-sm btn-outline-danger js-cancel-shipment-btn" 
                    data-tracking-number="${trackingNumber}"
					data-shipment-id="${shipmentId}"
					>
                <i class="bi-trash me-1"></i> Cancelar Envío
            </button>
        `;
		actionsContainer.innerHTML = cancelButtonHTML;
		setupCancelButtonListener();
	}

	try {
		const trackingResult = await ShippingService.trackShipment(provider, trackingNumber);

		renderTrackingTimeline(trackingResult);

		elements.trackingTitle.textContent = `Historial para ${trackingNumber}`;

		const lastEvent = trackingResult.events[0];
		console.log('Last Event:', lastEvent);


		if (lastEvent.typeCode && lastEvent.typeCode !== "OK" && provider === "dhl") {
			// const pendingRowHTML = `
            //     <div class="tracking-item-pending" id="pendingTrackingEvent">
                    
            //             <div class="tracking-icon status-intransit">
            //                 <svg class="svg-inline--fa fa-circle fa-w-16" aria-hidden="true" data-prefix="fas" data-icon="circle" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" data-fa-i2svg="">
            //                 <path fill="currentColor" d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z"></path>
            //                 </svg>
            //             </div>
            //             <div class="tracking-date">
            //             &nbsp; 
            //             </div>
            //             <div class="tracking-content">
            //                 Actividad de rastreo pendiente
            //             </div>
                    
                
            // `;
			// elements.trackingEventsContainer.insertAdjacentHTML('afterbegin', pendingRowHTML);

		} else if (provider === "dhl") {

			const { success, errorMsg } = await ZohoService.markShipmentAsDelivered(shipmentId);

			if (!success) {
				showRequestErrorToast('Update Shipment Error: ' + errorMsg, 7000);

				elements.trackingTitle.textContent = `<p class="text-danger">Error al actualizar el rastreo</p>`;
				elements.trackingEventsContainer.innerHTML = `${errorMsg}`;
			}
		}



		// const lastStatusDiv = document.getElementById(`trackingStatus0`);
		// lastStatusDiv.className = 'tracking-icon status-current blinker';

		const firstIcon = document.querySelector('.js-tracking-icon');
		if (firstIcon) {
			firstIcon.classList.add('status-current', 'blinker');
		}

	} catch (error) {
		elements.trackingTitle.textContent = "Error al cargar el rastreo";
		elements.trackingEventsContainer.innerHTML = `<p class="text-danger">${error.message}</p>`;
		// showRequestErrorToast(error.message, 7000); // Puedes reusar tu toast si quieres
	} finally {
		elements.trackingSpinner.classList.add('d-none');
	}	// } catch (error) {
	// 	showRequestErrorToast(error.message, 7000);
	// }
	//
}

function setupTrackingCardListeners() {
	const trackCards = document.querySelectorAll('.js-track-card');

	trackCards.forEach(card => {
		card.addEventListener('click', (event) => {
			trackCards.forEach(c => c.classList.remove('active'));
			card.classList.add('active');

			handleTrackingCardClick(event.currentTarget);
		});
	});
}


function renderTrackingCards(groupedPackages) {
	let cardsHTML = '';
	Object.keys(groupedPackages).forEach((trackingNumber, index) => {
		if (trackingNumber === 'notShipped') return;

		const packages = groupedPackages[trackingNumber];
		const shipmentId = packages[0].shipment_id;
		const provider = packages[0].provider;
		const shippingDate = packages[0].shipping_date;

		let packagesHTML = '';
		packages.forEach(pck => {
			packagesHTML += `
                <span class="badge text-bg-secondary me-1 mb-1">
                    ${pck.package_number}
                </span>
            `;
		});
		// ---------------------------------------------------

		cardsHTML += `
            <button class="card tracking-card-button p-3 text-start js-track-card"
                    data-tracking-number="${trackingNumber}"
                    data-shipment-id="${shipmentId}"
                    data-provider="${provider}"
					data-shipping-date="${shippingDate}">

                <div class="d-flex justify-content-between align-items-center mb-2">
                    <div class="fw-bold">Tracking# ${trackingNumber}</div>
                    <img src="${provider === 'dhl' ? 'ui/img/dhl-2.png' : 'ui/img/paquetexpress-logo.png'}" 
                         class="provider-logo-small" alt="${provider}">
                </div>
                
                <div class="mb-1">
                    ${packagesHTML}
                </div>

            </button>
        `;
	});
	return cardsHTML;
}
export function initializeTrackingView(appData) {


	elements.trackingCardsList = document.getElementById('trackingCardsList');
	elements.trackingEventsContainer = document.getElementById('trackingEvents');
	elements.trackingTitle = document.getElementById('trackingTitle');
	elements.trackingSpinner = document.getElementById('tracking-spinner');
	elements.trackingPlaceholder = document.getElementById('tracking-placeholder');
	elements.spinner = document.getElementById('spinnerWrapper'); // El spinner global

	const cardsHTML = renderTrackingCards(appData.data.groupedPackagesByShipment);
	elements.trackingCardsList.innerHTML = cardsHTML;

	setupTrackingCardListeners();

}
