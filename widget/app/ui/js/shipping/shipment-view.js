import { handleAutocomplete } from "./features/autocompleteZipCode.js";
import { setDateTimeFieldAttributes, hideFirstStepElements, handleRateRequest } from "./features/form.js";
import { validateShipmentForm } from "./features/formValidation.js";


const elements = {
    form: {
        sender: {},
        receiver: {},
        package: {}
    },
    warehouseCardsContainer: null,
    shipmentAlertMessageRow: null,
    spinner: null
};

const viewState = {
    selectedPackageIds: []
};

function handlePackageSelectionChange(event) {
    const checkbox = event.target; // Obtenemos el input que cambió
    const packageId = checkbox.value;

    console.log("handlePackageSelectionChange activada");

    if (checkbox.checked) {
        // Añade el ID si no está ya en la lista
        if (!viewState.selectedPackageIds.includes(packageId)) {
            viewState.selectedPackageIds.push(packageId);
        }
    } else {
        // Quita el ID si el checkbox se desmarca
        viewState.selectedPackageIds = viewState.selectedPackageIds.filter(id => id !== packageId);
    }

    console.log('Paquetes seleccionados:', viewState.selectedPackageIds);
}


function cacheDOMElements() {

    elements.form.sender.nombreInput = document.getElementById('senderNombre');
    elements.form.sender.empresaInput = document.getElementById('senderEmpresa');
    elements.form.sender.paisInput = document.getElementById('senderPais');
    elements.form.sender.direccionInput = document.getElementById('senderDireccion');
    elements.form.sender.direccion2Input = document.getElementById('senderDireccion2');
    elements.form.sender.direccion3Input = document.getElementById('senderDireccion3');
    elements.form.sender.codigoPostalInput = document.getElementById('senderCodigoPostal');
    elements.form.sender.ciudadInput = document.getElementById('senderCiudad');
    elements.form.sender.estadoInput = document.getElementById('senderEstado');
    elements.form.sender.emailInput = document.getElementById('senderEmail');
    elements.form.sender.telefonoInput = document.getElementById('senderTelefono');
    elements.form.sender.fechaInput = document.getElementById('senderFecha');

    elements.form.receiver.nombreInput = document.getElementById('receiverNombre');
    elements.form.receiver.empresaInput = document.getElementById('receiverEmpresa');
    elements.form.receiver.paisInput = document.getElementById('receiverPais');
    elements.form.receiver.direccionInput = document.getElementById('receiverDireccion');
    elements.form.receiver.direccion2Input = document.getElementById('receiverDireccion2');
    elements.form.receiver.direccion3Input = document.getElementById('receiverDireccion3');
    elements.form.receiver.codigoPostalInput = document.getElementById('receiverCodigoPostal');
    elements.form.receiver.ciudadInput = document.getElementById('receiverCiudad');
    elements.form.receiver.estadoInput = document.getElementById('receiverEstado');
    elements.form.receiver.emailInput = document.getElementById('receiverEmail');
    elements.form.receiver.telefonoInput = document.getElementById('receiverTelefono');


    elements.form.package.cantidadInput = document.getElementById('cantidadInput');
    elements.form.package.pesoInput = document.getElementById('pesoInput');
    elements.form.package.longitudInput = document.getElementById('longitudInput');
    elements.form.package.anchoInput = document.getElementById('anchoInput');
    elements.form.package.alturaInput = document.getElementById('alturaInput');
    elements.form.package.descripcionInput = document.getElementById('descripcionInput');


    elements.shipmentAlertMessageRow = document.getElementById('shipmentAlertMessageRow');

    elements.warehouseCardsContainer = document.getElementById('warehousePackagesCards');

    elements.spinner = document.getElementById('spinnerWrapper');

}


function renderWarehouseCards(groupedPackages) {
    let allCardsHTML = '';

    // Object.keys es más seguro que for...in para iterar sobre objetos
    Object.keys(groupedPackages).forEach(warehouseId => {
        const warehouse = groupedPackages[warehouseId][0];
        let packagesHTML = '';

        groupedPackages[warehouseId].forEach(pck => {
            packagesHTML += `
    <li class="list-group-item">
        <i class="bi-box-seam" style="margin-right: 0.5rem;"></i>
        <input class="form-check-input me-1 js-package-checkbox" type="checkbox" value="${pck.package_id}" id="pkg-check-${pck.package_id}">
        <label class="form-check-label" for="pkg-check-${pck.package_id}">${pck.package_number}</label>
    </li>
`;
        });

        // La tarjeta completa como un string de HTML
        allCardsHTML += `
            <div class="col-6">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">
                            <i class="bi-boxes" style="margin-right: 0.5rem;"></i>
                            ${warehouse.warehouse_name}
                            <button type="button" class="btn btn-secondary btn-sm float-end js-copy-btn" 
                                    data-warehouse-id="${warehouseId}" 
                                    title="Usar la información de este almacén para el formulario de origen.">
                                <i class="bi-copy"></i>
                            </button>
                        </h5>
                        <p class="card-text mt-2 mb-2">Paquetes disponibles en este almacén:</p>
                        <ul class="list-group mb-4">${packagesHTML}</ul>
                    </div>
                </div>
            </div>
        `;
    });

    return allCardsHTML;
}

// EN: shipment-view.js

function setupEventListeners(appData) {
    const { groupedPackages } = appData.data;

    // 1. Configurar los botones de "Copiar"
    const copyButtons = document.querySelectorAll('.js-copy-btn');

    console.log("elements", elements);

    copyButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            // Obtenemos el ID del almacén desde el data-attribute
            const warehouseId = event.currentTarget.dataset.warehouseId;
            const warehouseData = groupedPackages[warehouseId][0];

            console.log("elements.form.sender.nombreInput", elements.form.sender.nombreInput);
            elements.form.sender.nombreInput.value = warehouseData.attention;
            elements.form.sender.empresaInput.value = warehouseData.branch_name;
            elements.form.sender.paisInput.value = 'Mexico';
            elements.form.sender.direccionInput.value = warehouseData.address;
            elements.form.sender.direccion2Input.value = warehouseData.address2;
            elements.form.sender.direccion3Input.value = '';
            elements.form.sender.codigoPostalInput.value = warehouseData.zip;
            elements.form.sender.ciudadInput.value = warehouseData.city;
            elements.form.sender.estadoInput.value = warehouseData.state;
            elements.form.sender.emailInput.value = warehouseData.email;
            elements.form.sender.telefonoInput.value = warehouseData.phone;

            console.log(`Copiando datos del almacén: ${warehouseData.warehouse_name}`);
        });
    });

    const packageCheckboxes = document.querySelectorAll('.js-package-checkbox');
    packageCheckboxes.forEach(checkbox => {
        console.log("checkbox", checkbox);
        checkbox.addEventListener('change', handlePackageSelectionChange);
    });

    const nextButton = document.getElementById('nextStepShipmentBtn');
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            const isFormValid = validateShipmentForm(elements, viewState);

            if (isFormValid) {
                handleRateRequest(elements, viewState);
            } else {
                console.log("El formulario tiene errores.");
            }
        });
    }

}


function populateReceiverForm(appData) {
    const { soShippingAddress, contact } = appData.rawData;

    elements.form.receiver.nombreInput.value = soShippingAddress.attention;		//contactInformation.fullName
    elements.form.receiver.empresaInput.value = contact.contactFromAPI.company_name;		//contactInformation.companyName
    elements.form.receiver.paisInput.value = 'Mexico';								//postalAddress.countryName *Debemos agregar postalAddress.countryCode = MX
    elements.form.receiver.direccionInput.value = soShippingAddress.address;		//postalAddress.addressLine1
    elements.form.receiver.direccion2Input.value = soShippingAddress.street2;		//postalAddress.addressLine2
    elements.form.receiver.direccion3Input.value = '';
    elements.form.receiver.codigoPostalInput.value = soShippingAddress.zip;		//postalAddress.postalCode
    elements.form.receiver.ciudadInput.value = soShippingAddress.city;				//postalAddress.cityName
    elements.form.receiver.estadoInput.value = soShippingAddress.state;			//postalAddress.provinceName
    elements.form.receiver.emailInput.value = contact.soContactPerson.email;				//contactInformation.email
    elements.form.receiver.telefonoInput.value = soShippingAddress.phone;			//contactInformation.phone
}


export function initializeShipmentView(appData) {

    cacheDOMElements();

    console.log("appData", appData);

    if (!appData.validation.isValid) {
        elements.shipmentAlertMessageRow.style.display = 'block';
        elements.shipmentAlertMessageRow.innerHTML = appData.validation.error;

        hideFirstStepElements();

    }

    setDateTimeFieldAttributes(elements.form.sender.fechaInput);

    const warehouseHTML = renderWarehouseCards(appData.data.groupedPackages);

    console.log("warehouseHTML", warehouseHTML);
    console.log("elements.warehouseCardsContainer", elements.warehouseCardsContainer);

    if (elements.warehouseCardsContainer) {
        elements.warehouseCardsContainer.innerHTML = warehouseHTML;
    }

    setupEventListeners(appData);

    populateReceiverForm(appData);

    handleAutocomplete('senderCodigoPostal', 'autocompleteResults0', elements);
    handleAutocomplete('receiverCodigoPostal', 'autocompleteResults1', elements);


    spinnerWrapper.style.display = 'none';



}