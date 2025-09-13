import { handleAutocomplete } from "./features/autocompleteZipCode.js";
import { pcsAndNeighborhoods } from "../../../catalogs/CPs.min.js";
import { setDateTimeFieldAttributes, hideFirstStepElements } from "./features/form.js";
import { setupFormValidation } from "./features/formValidation.js";


const elements = {
    form: {
        sender: {},
        receiver: {},
        package: {}
    },
    warehouseCardsContainer: null,
    shipmentAlertMessageRow: null
};

const viewState = {
    selectedPackageIds: []
};

function handlePackageSelectionChange(event) {
    const checkbox = event.target; // Obtenemos el input que cambió
    const packageId = checkbox.value;

        
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

    elements.form.sender.NombreInput = document.getElementById('senderNombre');
    elements.form.sender.EmpresaInput = document.getElementById('senderEmpresa');
    elements.form.sender.PaisInput = document.getElementById('senderPais');
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

    elements.shipmentAlertMessageRow = document.getElementById('shipmentAlertMessageRow');

    elements.warehouseCardsContainer = document.getElementById('warehousePackagesCards');

}

// function renderWarehouseCards(groupedPackages) {
//     /*
//             This code dynamically creates HTML elements based on grouped packages data.
//             It creates a new div element for each warehouse and populates it with relevant information.
//             The created elements are then appended to the container div.

//             The code also adds a click event listener to each card body element, which handles the click event and sets the values of input fields accordingly.

//         */
//     // Create a new HTML element for each grouped package
//     let packageCardsEl = '';

//     for (const warehouseId in groupedPackages) {
//         let whIndex = 0;
//         const warehouse = groupedPackages[warehouseId][0];

//         // Create a new div element
//         const divElement = document.createElement('div');
//         divElement.classList.add('card', 'mb-3', 'mt-4', 'first-step');
//         divElement.style.display = 'none';

//         // Create a new card body element
//         const cardBodyElement = document.createElement('div');
//         cardBodyElement.classList.add('card-body');
//         cardBodyElement.classList.add('card-body-clickable');

//         // Create a new title element using the warehouse_name value
//         const titleElement = document.createElement('h6');
//         titleElement.classList.add('card-title');
//         titleElement.textContent = warehouse.warehouse_name;

//         // Append the title element to the card body element
//         cardBodyElement.appendChild(titleElement);

//         // Create a new list element
//         const listElement = document.createElement('ul');
//         listElement.classList.add('list-group', 'list-group-flush');

//         //
//         const packagesInWarehouse = groupedPackages[warehouseId];
//         let packagesEl = '';
//         packagesInWarehouse.forEach((pck, index) => {

//             const packageEl = `
//                                                 <li class="list-group-item">
//                                                     <i class="bi-box-seam" style="margin-right: 0.5rem;"></i>&nbsp;
//                                                     <input class="form-check-input me-1" type="checkbox" value="${pck.package_id}" id="packageCheckbox${index}" onclick="updateSelectedPackages(this)">
//                                                     <label class="form-check-label stretched-link" for="packageCheckbox${index}">${pck.package_number}</label>
//                                                 </li>
//                                     `;
//             packagesEl += packageEl;

//         });
//         const ulPackages = `
//                                         <ul class="list-group mb-4">
//                                             ${packagesEl}
//                                         </ul>
//                                 `;

//         const cardEl = `
//                                     <div class="col-6" id="packageCard${whIndex}">
//                                         <div class="card">
//                                             <div class="card-body">

//                                                 <h5 class="card-title">
//                                                     <i class="bi-boxes" style="margin-right: 0.5rem;"></i>
//                                                     ${warehouse.warehouse_name}
//                                                     <button type="button" class="btn btn-secondary" style="--bs-btn-padding-y: 0.1rem; --bs-btn-padding-x: .25rem; --bs-btn-font-size: .75rem; float: right;" id="packagesWhBtn${whIndex}"  data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Usar la información de este almacén para el formulario de origen.">
//                                                         <i class="bi-copy"></i>
//                                                     </button>
//                                                 </h5>
//                                                 <p class="card-text mt-2 mb-2">
//                                                     Paquetes disponibles en este almacén. Seleccione los paquetes que desea enviar.
//                                                 </p>

//                                                 <div class="row" id="packagesWhRow${whIndex}">
//                                                     ${ulPackages}
//                                                 </div>

//                                             </div>
//                                         </div>
//                                     </div>    
//                                 `;
//         packageCardsEl += cardEl;

//     }
//     return packageCardsEl;
// }


// function setupEventListeners(groupedPackages) {

//     for (const warehouseId in groupedPackages) {
//         const warehouse = groupedPackages[warehouseId][0];

//         // Create list items for each data field
//         const dataFields = ['address1', 'address2', 'state', 'phone', 'email', 'attention', 'package_number'];
//         dataFields.forEach(field => {
//             const listItemElement = document.createElement('li');
//             listItemElement.classList.add('list-group-item');
//             if (field === 'package_number') {
//                 let packagesEl = '';
//                 // Show each package_number
//                 groupedPackages[warehouseId].forEach(pck => {
//                     const packageNumberElement = document.createElement('span');
//                     packageNumberElement.classList.add('badge', 'text-bg-warning');
//                     packageNumberElement.textContent = pck[field];
//                     listItemElement.appendChild(packageNumberElement);
//                     //

//                     //
//                 });
//             } else {
//                 listItemElement.textContent = `${field}: ${warehouse[field]}`;
//             }
//             listElement.appendChild(listItemElement);
//         });

//         // Append the list element to the card body element
//         cardBodyElement.appendChild(listElement);


//         // Append the card body element to the div element
//         divElement.appendChild(cardBodyElement);

//         // Insert the new element as the first child of the container div
//         //const containerElement = document.querySelector('.container');
//         //shipment-tab-pane
//         //const shipmentTabPane = document.getElementById('shipment-tab-pane');
//         //shipmentTabPane.insertBefore(divElement, shipmentTabPane.firstChild);

//         const shipmentDetailsMessage = document.getElementById('shipmentDetailsMessage');
//         shipmentDetailsMessage.insertAdjacentElement('afterend', divElement);


//         const warehousePackagesCards = document.getElementById('warehousePackagesCards');
//         warehousePackagesCards.innerHTML = packageCardsEl;


//         const packagesWhBtn = document.getElementById(`packagesWhBtn${whIndex}`);
//         // Add a click event listener to the card body element
//         packagesWhBtn.addEventListener('click', () => {
//             // Handle the click event here
//             console.log('Card clicked');
//             // Set the values of each input field
//             elements.form.sender.nombreInput.value = warehouse.attention;
//             elements.form.sender.empresaInput.value = warehouse.branch_name;
//             elements.form.sender.paisInput.value = 'Mexico';
//             elements.form.sender.direccionInput.value = warehouse.address;
//             elements.form.sender.direccion2Input.value = warehouse.address2;
//             elements.form.sender.direccion3Input.value = '';
//             elements.form.sender.codigoPostalInput.value = warehouse.zip;
//             elements.form.sender.ciudadInput.value = warehouse.city;
//             elements.form.sender.estadoInput.value = warehouse.state;
//             elements.form.sender.emailInput.value = warehouse.email;
//             elements.form.sender.telefonoInput.value = warehouse.phone;

//         });

//         //containerElement.insertBefore(divElement, containerElement.firstChild);
//         if (groupedPackagesKeysSize === 1) {
//             packagesWhBtn.click();
//         }


//         let whIndex = 0;

//         const copyButton = document.getElementById(`packagesWhBtn${whIndex}`);
//         if (copyButton) {
//             copyButton.addEventListener('click', () => {
//                 // ... la lógica que rellena el formulario ...
//                 elements.form.sender.nombreInput.value = warehouse.attention;
//                 // ... etc.
//             });
//         }
//     }

//     // Aquí también irían los listeners para los checkboxes, el botón "Siguiente", etc.

// }



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
                    <input class="form-check-input me-1 js-package-checkbox" type="checkbox" value="${pck.package_id}">
                    <label class="form-check-label stretched-link">${pck.package_number}</label>
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
    copyButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            // Obtenemos el ID del almacén desde el data-attribute
            const warehouseId = event.currentTarget.dataset.warehouseId;
            const warehouseData = groupedPackages[warehouseId][0];

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

    // 2. Configurar los checkboxes de los paquetes
    const packageCheckboxes = document.querySelectorAll('.js-package-checkbox');
    packageCheckboxes.forEach(checkbox => {
        // Añadimos UN SOLO listener por checkbox al evento 'change'
        checkbox.addEventListener('change', handlePackageSelectionChange);
    });

    // 3. (Ejemplo) Configurar el botón "Siguiente"
    // const nextButton = document.getElementById('nextStepShipmentBtn');
    // nextButton.addEventListener('click', handleNextStepClick);
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

    console.log('pcsAndNeighborhoods: ', pcsAndNeighborhoods["20802"]);

    /*
    const toastLiveExample = document.getElementById('liveToast');
    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample);
    toastBootstrap.show();
    */

    // Get references to all the input fields


    // descripcionInput = document.getElementById('descripcionInput');
    //
    // spinnerWrapper = document.getElementById('spinnerWrapper');
    // shipmentAlertMessageRow = document.getElementById('shipmentAlertMessageRow');
    // shipmentAlertMessage = document.getElementById('shipmentAlertMessage');
    //


    cacheDOMElements();

    console.log("appData", appData);

    if (!appData.validation.isValid) {
        elements.form.shipmentAlertMessageRow.style.display = 'block';
        elements.form.shipmentAlertMessageRow.innerHTML = appData.validation.error;

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

    handleAutocomplete('senderCodigoPostal', 'autocompleteResults0');
    handleAutocomplete('receiverCodigoPostal', 'autocompleteResults1');

    setupFormValidation();

    spinnerWrapper.style.display = 'none';



}