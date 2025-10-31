import { ShippingService } from "../../../core/services/shipping.service.js";
import { showRequestErrorToast } from "../features/errorToast.js";

const elements = {
	podCardsContainer: null,
	podResultContainer: null,
	spinner: null
};

// podTab.style.display = 'block';
// trackingTab.style.display = 'none';
// shipmentTab.style.display = 'none';

function renderPodResult(podResult, trackingNumber) {
	const podContainer = document.getElementById('podPDFContainer');
	podContainer.innerHTML = '';

	const successMessage = `
			<div class="alert alert-secondary d-flex align-items-center mb-4" role="alert">
				<div>
					<i class="bi-file-earmark-pdf-fill" style="font-size: 1.1rem; color: rgb(10, 10, 10);"></i>
					&nbsp; <strong>La prueba digital de entrega fue recuperada correctamente para ${trackingNumber}.</strong>
				</div>
			</div>
	`;

	podContainer.innerHTML = successMessage;

	podResult.documents.forEach(doc => {
		if (doc.type === 'pdf') {
			const pdfContent = `data:application/pdf;base64,${doc.content}`;
			const iframe = document.createElement('iframe');
			iframe.src = pdfContent;
			iframe.style.width = '100%';
			iframe.style.height = '700px';
			podContainer.appendChild(iframe);
		}
		else if (doc.type === 'image') {
			const imgContent = `data:image/png;base64,${doc.content}`; // Asume PNG, puedes cambiarlo
			const img = document.createElement('img');
			img.src = imgContent;
			img.style.width = '100%';
			img.style.border = '1px solid #ccc';
			podContainer.appendChild(img);
		}
	});

}

async function handlePodButtonClick(event) {
	const trackingNumber = event.currentTarget.dataset.trackingNumber;
	const shipmentID = event.currentTarget.dataset.shipmentId;
	const provider = event.currentTarget.dataset.provider;

	console.log("event.currentTarget.dataset", event.currentTarget.dataset);

	try {
		elements.spinner.style.display = 'flex';

		const podResult = await ShippingService.getProofOfDelivery(provider, trackingNumber, shipmentID);

		renderPodResult(podResult, trackingNumber);

	} catch (error) {
		console.error("Error al obtener la prueba de entrega:", error);
		showRequestErrorToast(error.message, 7000);
	} finally {
		elements.spinner.style.display = 'none';
	}
}


function setupPodButtonListeners() {
	const podButtons = document.querySelectorAll('.js-pod-btn');
	podButtons.forEach(button => {
		button.addEventListener('click', handlePodButtonClick);
	});
}

function renderPodCards(groupedPackages) {
	let podCardsHTML = '';

	Object.keys(groupedPackages).forEach((trackingNumber, index) => {

		if (trackingNumber === 'notShipped') return;

		const shipmentID = groupedPackages[trackingNumber]?.[0]?.shipment_id
		const provider = groupedPackages[trackingNumber]?.[0]?.provider



		podCardsHTML += `
            <div class="col-6 mb-4" id="podCard${index}">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Tracking# - ${trackingNumber}</h5>
                        <div class="d-grid mb-2">
                            <button class="btn btn-primary js-pod-btn" type="button" 
                                    data-tracking-number="${trackingNumber}" data-shipment-id="${shipmentID}" data-provider="${provider}" id="podBtn${index}">
                                Obtener prueba de entrega
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
	});

	return podCardsHTML;
}

export function initializePodView(appData) {
	elements.podCardsContainer = document.getElementById('podCards');
	elements.podResultContainer = document.getElementById('podResultContainer');
	elements.spinner = document.getElementById('spinnerWrapper');

	console.log("groupedPackagesByShipment", appData.data.groupedPackagesByShipment);

	const podCardsHTML = renderPodCards(appData.data.groupedPackagesByShipment);
	console.log("podCardsHTML", podCardsHTML);
	elements.podCardsContainer.innerHTML = podCardsHTML;


	setupPodButtonListeners();
}