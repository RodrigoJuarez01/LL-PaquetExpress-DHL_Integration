import { ShippingService } from "../../../core/services/shipping.service.js";
import { showRequestErrorToast } from "../features/errorToast.js";
// Asumimos que ZohoService se usa en el adaptador de PaquetExpress
// import ZohoService from '../../../core/services/zoho.service.js'; 

// 1. Objeto `elements` actualizado para el nuevo layout
const elements = {
	podListView: null,
	podDetailView: null,
	podCardsContainer: null,
	podResultContainer: null,
	podSpinner: null,
	spinner: null // El spinner global
};

/**
 * La función principal que se exporta y se llama desde main.js
 */
export function initializePodView(appData) {
	// 1. Cachea los elementos del DOM
	elements.podListView = document.getElementById('pod-list-view');
	elements.podDetailView = document.getElementById('pod-detail-view');
	elements.podCardsContainer = document.getElementById('podCards');
	elements.podResultContainer = document.getElementById('podPDFContainer');
	elements.podSpinner = document.getElementById('pod-spinner');
	elements.spinner = document.getElementById('spinnerWrapper');

	// 2. Renderiza las tarjetas-botón en la lista
	const podCardsHTML = renderPodCards(appData.data.groupedPackagesByShipment);
	elements.podCardsContainer.innerHTML = podCardsHTML;

	// 3. Configura los listeners (botones de la lista Y el botón "Volver")
	setupPodListeners(appData);
}

// EN: /ui/js/features/pod-view.js

function renderPodCards(groupedPackages) {
	let podCardsHTML = '';

	// Define los logos aquí o impórtalos de un config
	const providerLogos = {
		'dhl': 'ui/img/dhl-2.png',
		'paquetexpress': 'ui/img/paquetexpress-logo.png'
	};

	Object.keys(groupedPackages).forEach((trackingNumber, index) => {
		if (trackingNumber === 'notShipped') return;

		const packages = groupedPackages[trackingNumber];
		const shipmentId = packages[0].shipment_id;
		const provider = packages[0].provider || 'dhl'; // Asume DHL si no hay proveedor

		// --- 1. Construye los badges de los paquetes ---
		let packagesHTML = '';
		packages.forEach(pck => {
			packagesHTML += `<span class="badge text-bg-secondary me-1 mb-1">${pck.package_number}</span>`;
		});

		// --- 2. Construye la tarjeta completa (similar a la de Tracking) ---
		podCardsHTML += `
            <div class="col-md-6 mb-3">
                <div class="card h-100">
                    <div class="card-body d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <div class="fw-bold">Tracking# ${trackingNumber}</div>
                            <img src="${providerLogos[provider] || ''}" class="provider-logo-small" alt="${provider}">
                        </div>
                        <div class_."mb-2">${packagesHTML}</div>
                        
                        <div class="d-grid mt-auto">
                            <button class="btn btn-primary js-pod-btn" type="button" 
                                    data-tracking-number="${trackingNumber}"
                                    data-provider="${provider}"
                                    data-shipment-id="${shipmentId}">
                                Ver Prueba de Entrega
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
	});
	return podCardsHTML;
}

/**
 * Configura los listeners para la lista de tarjetas y el botón "Volver".
 */
function setupPodListeners(appData) {
	// 1. Listener para el botón "Volver"
	const backButton = document.getElementById('btn-back-to-pod-list');
	if (backButton) {
		backButton.addEventListener('click', () => {
			elements.podListView.classList.remove('d-none');
			elements.podDetailView.classList.add('d-none');
			elements.podResultContainer.innerHTML = ''; // Limpia el iframe/img
		});
	}

	// 2. Listener para las tarjetas (usando delegación de eventos)
	if (elements.podCardsContainer) {
		elements.podCardsContainer.addEventListener('click', (event) => {
			const podButton = event.target.closest('.js-pod-btn');
			if (podButton) {
				handlePodButtonClick(podButton);
			}
		});
	}
}

async function handlePodButtonClick(button) {
	const trackingNumber = button.dataset.trackingNumber;
	const provider = button.dataset.provider;
	const shipmentId = button.dataset.shipmentId;

	// 1. Cambia de vista y muestra el spinner (esto ya lo tienes)
	elements.podListView.classList.add('d-none');
	elements.podDetailView.classList.remove('d-none');
	elements.podSpinner.classList.remove('d-none');
	elements.podResultContainer.innerHTML = '';

	try {
		const podResult = await ShippingService.getProofOfDelivery(provider, trackingNumber, shipmentId);

		// Comprobación extra: ¿El servicio devolvió documentos?
		if (podResult.documents && podResult.documents.length > 0 && podResult.documents[0].content) {
			renderPodResult(podResult, trackingNumber);
		} else {
			// Caso raro: el servicio funcionó pero no devolvió archivos
			throw new Error("El documento de Prueba de Entrega está vacío o aún no está disponible.");
		}

	} catch (error) {
		// ¡AQUÍ ESTÁ LA SOLUCIÓN AL PUNTO 3!
		// En lugar de un toast, renderiza un "cuadrado rojo" dentro del contenedor
		elements.podResultContainer.innerHTML = `
            <div class="alert alert-warning" role="alert">
                <h5 class="alert-heading"><i class="bi-exclamation-triangle-fill me-2"></i> Documento No Disponible</h5>
                <p>No se pudo recuperar la prueba de entrega para el envío <strong>${trackingNumber}</strong>.</p>
                <hr>
                <p class="mb-0 small text-muted">Motivo: ${error.message}</p>
            </div>
        `;
	} finally {
		elements.podSpinner.classList.add('d-none');
	}
}

/**
 * Renderiza el PDF o la Imagen en el contenedor de detalles.
 * (Esta es tu función original, ligeramente limpiada).
 */
function renderPodResult(podResult, trackingNumber) {
	const podContainer = elements.podResultContainer;
	podContainer.innerHTML = ''; // Limpia el spinner

	// 1. Pinta el mensaje de éxito
	const successMessage = `
        <div class="alert alert-secondary d-flex align-items-center mb-4" role="alert">
            <div>
                <i class="bi-file-earmark-check-fill"></i>
                &nbsp; <strong>Mostrando Prueba de Entrega para ${trackingNumber}.</strong>
            </div>
        </div>
    `;
	podContainer.innerHTML = successMessage;

	// 2. Itera sobre los documentos y los renderiza
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
			const imgContent = `data:image/png;base64,${doc.content}`; // Asume PNG
			const img = document.createElement('img');
			img.src = imgContent;
			img.style.width = '100%';
			img.style.maxWidth = '600px'; // Límite para que no sea gigante
			img.style.border = '1px solid #ccc';
			podContainer.appendChild(img);
		}
	});
}