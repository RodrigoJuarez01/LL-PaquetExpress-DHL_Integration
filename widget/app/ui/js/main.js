import { showRequestErrorToast } from "./features/errorToast.js";
import { initializeShipmentView } from './shipping/shipment-view.js';
import ZohoService from "../../logic/services/zoho.service.js"


let appData = {};
const tabContainer = document.getElementById('tab-content-container');
const viewInitializers = {
    'view-create-shipment': initializeShipmentView,
    // 'view-tracking': initializeTrackingView,
    // 'view-pod': initializePodView
};

function loadView(viewId) {
    const tabContainer = document.getElementById('tab-content-container');
    
    const template = document.getElementById(viewId);

    if (template) {
        tabContainer.innerHTML = template.innerHTML;

        if (viewInitializers[viewId]) {
            viewInitializers[viewId](appData);
        }
    } else {
        console.error(`No se encontró la plantilla con ID: ${viewId}`);
        tabContainer.innerHTML = `<div class="alert alert-danger m-4">Error: Vista no encontrada.</div>`;
    }
}

function setupTabListeners() {
    const tabs = document.querySelectorAll('.nav-link[data-view]');
    tabs.forEach(tab => {
        tab.addEventListener('click', (event) => {
            tabs.forEach(t => t.classList.remove('active'));
            event.target.classList.add('active');

            const viewFile = event.target.getAttribute('data-view');
            loadView(viewFile);
        });
    });
}



const dhlBaseUrl = 'https://express.api.dhl.com/mydhlapi';
let dhlUrlComplement = '';

//
let packagesAndWarehouse = [];
let groupedPackages = {};
let groupedPackagesByShipment = {};
let selectedPackageIds = [];
//
// let senderNombreInput;
// let senderEmpresaInput;
// let senderPaisInput;
// let senderDireccionInput;
// let senderDireccion2Input;
// let senderDireccion3Input;
// let senderCodigoPostalInput;
// let senderCiudadInput;
// let senderEstadoInput;
// let senderEmailInput;
// let senderTelefonoInput;
// let senderFechaInput;
//
// let receiverNombreInput;
// let receiverEmpresaInput;
// let receiverPaisInput;
// let receiverDireccionInput;
// let receiverDireccion2Input;
// let receiverDireccion3Input;
// let receiverCodigoPostalInput;
// let receiverCiudadInput;
// let receiverEstadoInput;
// let receiverEmailInput;
// let receiverTelefonoInput;
// //
// let cantidadInput;
// let pesoInput;
// let longitudInput;
// let anchoInput;
// let alturaInput;
//
// let descripcionInput;
// Aún no se mueve (de aquí para abajo)

// let cantidadValue, pesoValue, longitudValue, anchoValue, alturaValue, descripcionValue;
// let senderNombreValue, senderEmpresaValue, senderPaisValue, senderDireccionValue,
//     senderDireccion2Value, senderDireccion3Value, senderCodigoPostalValue, senderCiudadValue,
//     senderEstadoValue, senderEmailValue, senderTelefonoValue, senderFechaValue;
// let receiverNombreValue, receiverEmpresaValue, receiverPaisValue, receiverDireccionValue,
//     receiverDireccion2Value, receiverDireccion3Value, receiverCodigoPostalValue,
//     receiverCiudadValue, receiverEstadoValue, receiverEmailValue, receiverTelefonoValue;
// //
// // let orgID;
// // let  ;
// let salesorderNumber;
// let currentUser;
// //
// let shipmentTrackingNumber;
// let trackingUrl;
// //
// let spinnerWrapper;
// let shipmentAlertMessageRow;
// let shipmentAlertMessage;
// //
// let auxDataFromSelectedRate;
// //
// let packageWithoutWarehouse;
// let isPackagePteAlmacenEmpty = false;
// let isSalesOrderPteAlmacenEmpty = false;
// let isPteAlmacenMatched = true;

//let packagesWithPteAlmacenEmpty = [];


window.onload = function () {

    ZFAPPS.extension.init().then(async function (App) {

        const spinner = document.getElementById('spinnerWrapper');
        try {
            spinner.style.display = 'flex'; // Muestra el spinner

            appData = await ZohoService.initializeAppData();

            setupTabListeners();

            loadView('view-create-shipment');


            ZFAPPS.get("user").then((response) => {
                console.log("Datos del usuario: ");
                console.log(response);
                if (response.hasOwnProperty('user')) {
                    const currentUser = response.user;
                }
            });

            //To resize the frame size
            ZFAPPS.invoke('RESIZE', { width: '800px', height: '700px' }).then(function (res) {
                //response Handling
            });


        } catch (error) {
            console.error("Error fatal al inicializar el widget:", error);
            // Mostrar un error general si la carga de datos falla
        } finally {
            spinner.style.display = 'none'; // Oculta el spinner al final
        }

    });

};
