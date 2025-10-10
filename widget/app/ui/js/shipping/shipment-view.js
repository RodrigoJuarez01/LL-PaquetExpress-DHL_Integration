import { handleAutocomplete } from "./features/autocompleteZipCode.js";
import { setDateTimeFieldAttributes, hideFirstStepElements, _collectFormData } from "./features/form.js";
import { validateShipmentForm } from "./features/formValidation.js";
import { ShippingService } from "../../../core/services/shipping.service.js";
import { showRequestErrorToast } from "../features/errorToast.js";
import { displayAndDownloadPDFs } from "./features/shipping.js";
import { warehouseAddressMap } from "../../../catalogs/warehouse-adress-map.js";
import ZohoService from "../../../core/services/zoho.service.js"

const elements = {
    form: {
        sender: {},
        receiver: {},
        package: {}
    },
    warehouseCardsContainer: null,
    shipmentAlertMessageRow: null,
    spinner: null,
    appData: null
};

const viewState = {
    selectedPackageIds: []
};


async function handleRateSelection(event) {


    // 3. El resto de tu código es exactamente igual
    const button = event.currentTarget;
    const rateJsonBase64 = button.dataset.rateJson;
    const selectedRateData = JSON.parse(atob(rateJsonBase64));

    const provider = button.dataset.provider;


    console.log("selectedRateData", selectedRateData);
    // console.log("Type of decodedProduct:", typeof parsedProduct);

    const productCode = selectedRateData.productCode;
    const localProductCode = selectedRateData.localProductCode;
    // Do something with the productCode and localProductCode
    console.log("Selected productCode:", productCode);
    console.log("Selected localProductCode:", localProductCode);

    try {
        // elements.spinner.style.display = 'flex';

        const formData = _collectFormData(elements.form);


        // const ratesContainerResponse = document.getElementById('ratesContainerResponse');
        // ratesContainerResponse.style.display = 'none';

        selectedRateData.plannedShippingDateAndTime = formData.sender.plannedShippingDateAndTime;

        const shipmentResult = await ShippingService.createShipment(provider, formData, selectedRateData);

        displayAndDownloadPDFs(shipmentResult);

        console.log("elements.appData", elements.appData);

        const { resultMessage, success } = await ZohoService.upsertZohoShipment(shipmentResult, selectedRateData, elements.appData.data.packagesAndWarehouse, viewState.selectedPackageIds);

        if (success) {
            const auxLabelSuccessMsg = document.getElementById('auxLabelSuccessMsg');
            auxLabelSuccessMsg.innerHTML = resultMessage;
        } else {
            showRequestErrorToast(resultMessage, 7000);
        }
        //
        elements.spinner.style.display = 'none';
        //
        ZFAPPS.invoke('REFRESH_DATA', 'salesorder');


    } catch (error) {
        console.error("Error al crear el envío:", error);
        // showRequestErrorToast("No se pudo crear la guía.");
    } finally {
        elements.spinner.style.display = 'none';
    }

}

function handlePackageSelectionChange(event) {
    const checkbox = event.target;
    const packageId = checkbox.value;

    console.log("handlePackageSelectionChange activada");

    if (checkbox.checked) {
        if (!viewState.selectedPackageIds.includes(packageId)) {
            viewState.selectedPackageIds.push(packageId);
        }
    } else {
        viewState.selectedPackageIds = viewState.selectedPackageIds.filter(id => id !== packageId);
    }

    console.log('Paquetes seleccionados:', viewState.selectedPackageIds);
}


function setupRateSelectionListeners() {
    const selectButtons = document.querySelectorAll('.js-select-rate-btn');

    selectButtons.forEach(button => {
        button.addEventListener('click', handleRateSelection);
    });
}

    function renderRatesView(rates) {
        const ratesContainer = document.getElementById("ratesContainerResponse");
        // const formContainer = document.getElementById("shipmentFormContainer"); 

        const providerLogos = {
            'dhl': 'ui/img/dhl-2.png',
            'paquetexpress': 'ui/img/paquetexpress-logo.png'
        };


        const ratesHTML = rates.map(rate => {
            const originalDataJson = btoa(JSON.stringify(rate.originalData));

            return `
                <div class="row rate-row align-items-center py-3 border-bottom">
                    <div class="col-md-3">
                        <img src="${providerLogos[rate.provider] || ''}" alt="${rate.provider}" class="provider-logo">
                        <span>${rate.serviceName}</span>
                    </div>
                    <div class="col-md-3 text-center">${rate.estimatedDelivery}</div>
                    <div class="col-md-3 text-center"><b>$${rate.price} ${rate.currency}</b></div>
                    <div class="col-md-3 text-center">
                        <button type="button" class="btn btn-primary js-select-rate-btn" data-rate-json="${originalDataJson}" data-provider="${rate.provider}"> 
                            Seleccionar
                        </button>
                    </div>
                </div>
            `;
        }).join('');


    ratesContainer.innerHTML = `
        <div class="alert alert-secondary">Selecciona una tarifa de envío.</div>
        <div class="row rate-header fw-bold py-2 border-bottom">
            <div class="col-md-3">Servicio</div>
            <div class="col-md-3 text-center">Entrega Estimada</div>
            <div class="col-md-3 text-center">Precio</div>
            <div class="col-md-3 text-center"></div>
        </div>
        ${ratesHTML}
    `;

    ratesContainerResponse.style.display = "block";
    const firstStepElements = document.getElementsByClassName("first-step");
    for (let i = 0; i < firstStepElements.length; i++) {
        firstStepElements[i].style.display = "none";
    }

    ratesContainer.style.display = 'block';

    setupRateSelectionListeners();
}

export async function handleRateRequest(formElements) {

    try {
        elements.spinner.style.display = 'flex';

        const formData = _collectFormData(formElements.form);

        const rates = await ShippingService.getAllRates(formData);

        renderRatesView(rates);

    } catch (error) {
        console.error("Error al obtener tarifas:", error);
        showRequestErrorToast(error.message, 7000);
        // showRequestErrorToast("No se pudieron obtener las tarifas.");
    } finally {
        elements.spinner.style.display = 'none';
    }

}



function cacheDOMElements() {

    elements.form.sender.nombreInput = document.getElementById('senderNombre');
    elements.form.sender.empresaInput = document.getElementById('senderEmpresa');
    elements.form.sender.paisInput = document.getElementById('senderPais');
    // elements.form.sender.direccionInput = document.getElementById('senderDireccion');
    elements.form.sender.calleInput = document.getElementById('senderCalle');
    elements.form.sender.numeroInput = document.getElementById('senderNumero');
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
    // elements.form.receiver.direccionInput = document.getElementById('receiverDireccion');
    elements.form.receiver.calleInput = document.getElementById('receiverCalle');
    elements.form.receiver.numeroInput = document.getElementById('receiverNumero');
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

/**
 * Intenta separar una dirección completa en calle, número y detalles de interior.
 * @param {string} fullAddress - La dirección completa.
 * @returns {{street: string, number: string, interior: string}}
 */
function parseAddress(fullAddress) {
    let streetLine = fullAddress;
    let interior = '';

    // --- PASO 1: Busca y separa los detalles de "interior" ---
    const interiorKeywords = ['PISO', 'INT', 'INTERIOR', 'DPTO', 'DEPARTAMENTO', 'LOCAL', 'OFICINA'];
    // Creamos un regex para buscar cualquiera de estas palabras
    const regexInterior = new RegExp(`\\b(${interiorKeywords.join('|')})\\s`, 'i');
    const interiorMatch = fullAddress.match(regexInterior);

    if (interiorMatch) {
        // Si encuentra una palabra clave, divide la cadena en ese punto
        const splitIndex = interiorMatch.index;
        streetLine = fullAddress.substring(0, splitIndex).trim();
        interior = fullAddress.substring(splitIndex).trim();
    }

    // --- PASO 2: Ahora, en la parte principal, busca la calle y el número ---
    // Usamos una versión mejorada del primer regex, que busca el número al final de la cadena
    const regexStreetNumber = /^(.*?)\s*(#?[\w\d-]+)\s*$/;
    const streetNumberMatch = streetLine.match(regexStreetNumber);

    if (streetNumberMatch) {
        // ¡Éxito! Encontramos calle y número
        return {
            street: streetNumberMatch[1].trim(),
            number: streetNumberMatch[2].trim(),
            interior: interior // El que encontramos en el paso 1
        };
    } else {
        // Fallback final: si no se pudo separar calle y número,
        // todo es calle y el usuario lo arreglará.
        return {
            street: streetLine,
            number: '',
            interior: interior
        };
    }
}

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
            const warehouseName = warehouseData.warehouse_name;

            const warehouseCatalogAddress = warehouseAddressMap[warehouseName];

            const num = warehouseCatalogAddress.interior ? `${warehouseCatalogAddress.number} Int. ${warehouseCatalogAddress.interior}` : warehouseCatalogAddress.number;

            const parsedAddr = parseAddress(warehouseData.address);
            elements.form.sender.calleInput.value = warehouseCatalogAddress.street;  // Asumiendo que ahora tienes 'calleInput'
            elements.form.sender.numeroInput.value = num;

            console.log("elements.form.sender.nombreInput", elements.form.sender.nombreInput);
            elements.form.sender.nombreInput.value = warehouseData.attention;
            elements.form.sender.empresaInput.value = warehouseData.branch_name;
            elements.form.sender.paisInput.value = 'Mexico';
            elements.form.sender.direccion2Input.value = warehouseCatalogAddress.colonia;
            elements.form.sender.direccion3Input.value = '';
            elements.form.sender.codigoPostalInput.value = warehouseCatalogAddress.zipCode;
            elements.form.sender.ciudadInput.value = warehouseCatalogAddress.city;
            elements.form.sender.estadoInput.value = warehouseCatalogAddress.state;
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

    const parsedAddr = parseAddress(soShippingAddress.address);
    elements.form.receiver.calleInput.value = parsedAddr.street;  // Asumiendo que ahora tienes 'calleInput'
    elements.form.receiver.numeroInput.value = parsedAddr.number; // y 'numeroInput' en tu objeto 'elements'

    // elements.form.receiver.direccionInput.value = soShippingAddress.address;		//postalAddress.addressLine1
    elements.form.receiver.direccion2Input.value = soShippingAddress.street2;		//postalAddress.addressLine2
    elements.form.receiver.direccion3Input.value = '';
    elements.form.receiver.codigoPostalInput.value = soShippingAddress.zip;		//postalAddress.postalCode
    elements.form.receiver.ciudadInput.value = soShippingAddress.city;				//postalAddress.cityName
    elements.form.receiver.estadoInput.value = soShippingAddress.state;			//postalAddress.provinceName
    elements.form.receiver.emailInput.value = contact.soContactPerson.email;				//contactInformation.email
    elements.form.receiver.telefonoInput.value = soShippingAddress.phone;			//contactInformation.phone

    // <small>Dirección en Zoho: <span>${appData.rawData.soShippingAddress.address}</span></small>
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

    elements.appData = appData;

    setupEventListeners(appData);

    populateReceiverForm(appData);

    handleAutocomplete('senderCodigoPostal', 'autocompleteResults0', elements);
    handleAutocomplete('receiverCodigoPostal', 'autocompleteResults1', elements);


    spinnerWrapper.style.display = 'none';



}