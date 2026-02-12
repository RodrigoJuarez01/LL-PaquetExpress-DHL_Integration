import { handleAutocomplete } from "./features/autocompleteZipCode.js";
import { setDateTimeFieldAttributes, hideFirstStepElements, _collectFormData } from "./features/form.js";
import { validateShipmentForm } from "./features/formValidation.js";
import { ShippingService } from "../../../core/services/shipping.service.js";
import { showRequestErrorToast } from "../features/errorToast.js";
import { displayAndDownloadPDFs } from "./features/shipping.js";
import { warehouseAddressMap } from "../../../catalogs/warehouse-adress-map.js";
import ZohoService from "../../../core/services/zoho.service.js"
import { showShipmentError } from "./features/formValidation.js"

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


async function createShipmentLogic(button) {


    // const button = event.currentTarget;

    console.log("button", button);
    const rateJsonBase64 = button.dataset.rateJson;
    const selectedRateData = JSON.parse(atob(rateJsonBase64));

    const provider = button.dataset.provider;


    console.log("selectedRateData", selectedRateData);

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

        const shipmentResult = await ShippingService.createShipment(provider, formData, selectedRateData, viewState.selectedPackageIds);

        document.getElementById('ratesContainerResponse').style.display = 'none';

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
        button.disabled = false;
        button.classList.replace('btn-success', 'btn-primary');
        button.innerHTML = 'Seleccionar';
        showShipmentError(error.message);
        resetAllRateCells();
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



function handleSelectClick(selectButton) {

    const clickedCell = selectButton.closest('.js-rate-btn-container');

    // 2. Rescata los datos de esa celda
    const rateData = clickedCell.dataset.rateJson;
    const provider = clickedCell.dataset.provider;

    document.querySelectorAll('.js-select-rate-btn').forEach(btn => {
        if (btn !== selectButton) {
            btn.disabled = true;
        }
    });

    // 4. Reemplaza el contenido de la CELDA PRESIONADA por los botones nuevos
    clickedCell.innerHTML = `
        <div class="btn-group" role="group">
            <button type="button" class="btn btn-success js-confirm-btn" 
                    data-rate-json="${rateData}" 
                    data-provider="${provider}">
                 Confirmar
            </button>
            <button type="button" class="btn btn-danger js-cancel-btn" 
                    data-rate-json="${rateData}" 
                    data-provider="${provider}">
                <i class="bi-x"></i>
            </button>
        </div>
    `;
}


function handleCancelClick(cancelButton) {
    resetAllRateCells();
}


async function handleConfirmClick(confirmButton) {

    if (confirmButton.disabled || confirmButton.dataset.processing === "true") {
        console.warn("Doble click prevenido o listener duplicado.");
        return;
    }

    // Marca el botón como procesando para evitar condiciones de carrera
    confirmButton.dataset.processing = "true";
    confirmButton.disabled = true;


    const btnWidth = confirmButton.offsetWidth + 'px';

    confirmButton.disabled = true;
    confirmButton.style.minWidth = btnWidth;



    const cancelButton = confirmButton.nextElementSibling; // El botón de cancelar
    if (cancelButton) {
        cancelButton.disabled = true;
    }



    confirmButton.innerHTML = `
        <span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
    `;
    // OPCIÓN B: Spinner de "Giro" (pero sin texto)
    // confirmButton.innerHTML = `
    //     <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    // `;

    // 3. Llama a la lógica de negocio
    // (Renombramos tu 'handleRateSelection' a 'createShipmentLogic' para más claridad)

    try {
        await createShipmentLogic(confirmButton);
    } catch (error) {
        // Si falla, recuerda quitar el flag de processing
        delete confirmButton.dataset.processing;
        throw error; // Deja que el catch de createShipmentLogic maneje lo visual, o manéjalo aquí
    }
}

function setupRateSelectionListeners() {
    
    const ratesContainer = document.getElementById('ratesContainerResponse');
    const newRatesContainer = ratesContainer.cloneNode(true);
    ratesContainer.parentNode.replaceChild(newRatesContainer, ratesContainer);

    newRatesContainer.addEventListener('click', (event) => {
        const selectBtn = event.target.closest('.js-select-rate-btn');
        const confirmBtn = event.target.closest('.js-confirm-btn');
        const cancelBtn = event.target.closest('.js-cancel-btn');

        if (selectBtn) {
            handleSelectClick(selectBtn);
        } else if (confirmBtn) {
            handleConfirmClick(confirmBtn);
        } else if (cancelBtn) {
            handleCancelClick(cancelBtn);
        }
    });

    const backBtn = document.getElementById('btn-back-to-form');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            document.getElementById('ratesContainerResponse').style.display = 'none';
            document.getElementById('shipment-form-container').style.display = 'block';
        });
    }
}

function resetAllRateCells() {
    document.querySelectorAll('.js-rate-btn-container').forEach(cell => {
        const rateData = cell.dataset.rateJson;
        const provider = cell.dataset.provider;
        cell.innerHTML = `
            <button type="button" class="btn btn-primary js-select-rate-btn" 
                    data-rate-json="${rateData}" 
                    data-provider="${provider}">
                Seleccionar
            </button>
        `;
    });
}

function renderRatesView(rates) {
    const ratesContainer = document.getElementById("ratesContainerResponse");
    // const formContainer = document.getElementById("shipmentFormContainer"); 

    const providerLogos = {
        'dhl': 'ui/img/dhl-2.png',
        // 'paquetexpress': 'ui/img/paquetexpress-logo.png'
        'paquetexpress': 'ui/img/paquetexpress-logo-2.jpg'
    };


    const ratesHTML = rates.map(rate => {
        const rateDataJson = btoa(JSON.stringify(rate));

        return `
            <div class="row rate-row align-items-center py-3 border-bottom">
                
                <div class="col-md-3 d-flex align-items-center">
                    <img src="${providerLogos[rate.provider] || ''}" alt="${rate.provider}" class="provider-logo">
                    <span>${rate.serviceName}</span>
                </div>
                
                <div class="col-md-3 text-center">${rate.estimatedDelivery}</div>
                
                <div class="col-md-3 text-center"><b>$${rate.price} ${rate.currency}</b></div>
                
                <div class="col-md-3 text-center js-rate-btn-container" 
                     data-rate-json="${rateDataJson}" 
                     data-provider="${rate.provider}">
                    
                    <button type="button" class="btn btn-primary js-select-rate-btn" 
                            data-rate-json="${rateDataJson}" 
                            data-provider="${rate.provider}">
                        Seleccionar
                    </button>
                </div>

            </div>
        `;
    }).join('');


    ratesContainer.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mt-3">
            <h5 class="mb-0">Resultados de la Cotización</h5>
            <button class="btn btn-sm btn-outline-secondary" id="btn-back-to-form">
                <i class="bi-arrow-left me-1"></i> Regresar al Formulario
            </button>
        </div>
        <hr>
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
    // const firstStepElements = document.getElementsByClassName("first-step");
    // for (let i = 0; i < firstStepElements.length; i++) {
    //     firstStepElements[i].style.display = "none";
    // }

    ratesContainer.style.display = 'block';

    setupRateSelectionListeners();
}

export async function handleRateRequest(formElements) {

    try {
        elements.spinner.style.display = 'flex';

        const formData = _collectFormData(formElements.form);

        // const rates = await ShippingService.getRates("paquetexpress",formData);
        const rates = await ShippingService.getAllRates(formData);

        document.getElementById('shipment-form-container').style.display = 'none';

        renderRatesView(rates);

    } catch (error) {
        console.error("Error al obtener tarifas:", error);
        showRequestErrorToast(error.message, 15000);
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


function parseAddress(fullAddress) {
    let streetLine = fullAddress;
    let interior = '';

    const interiorKeywords = ['PISO', 'INT', 'INTERIOR', 'DPTO', 'DEPARTAMENTO', 'LOCAL', 'OFICINA'];
    const regexInterior = new RegExp(`\\b(${interiorKeywords.join('|')})\\s`, 'i');
    const interiorMatch = fullAddress?.match(regexInterior);

    if (interiorMatch) {
        const splitIndex = interiorMatch.index;
        streetLine = fullAddress?.substring(0, splitIndex).trim();
        interior = fullAddress?.substring(splitIndex).trim();
    }

    const regexStreetNumber = /^(.*?)\s*(#?[\w\d-]+)\s*$/;
    const streetNumberMatch = streetLine.match(regexStreetNumber);

    if (streetNumberMatch) {
        return {
            street: streetNumberMatch[1].trim(),
            number: streetNumberMatch[2].trim(),
            interior: interior
        };
    } else {

        return {
            street: streetLine,
            number: '',
            interior: interior
        };
    }
}

function setupEventListeners(appData) {
    const { groupedPackages } = appData.data;

    const copyButtons = document.querySelectorAll('.js-copy-btn');

    console.log("elements", elements);

    copyButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const warehouseId = event.currentTarget.dataset.warehouseId;
            const warehouseData = groupedPackages[warehouseId][0];
            const warehouseName = warehouseData.warehouse_name;

            const warehouseCatalogAddress = warehouseAddressMap[warehouseName];

            const num = warehouseCatalogAddress.interior ? `${warehouseCatalogAddress.number} Int. ${warehouseCatalogAddress.interior}` : warehouseCatalogAddress.number;

            // const parsedAddr = parseAddress(warehouseData.address);
            elements.form.sender.calleInput.value = warehouseCatalogAddress.street;
            elements.form.sender.numeroInput.value = num;

            console.log("elements.form.sender.nombreInput", elements.form.sender.nombreInput);
            elements.form.sender.nombreInput.value = warehouseCatalogAddress.attention;
            elements.form.sender.empresaInput.value = warehouseCatalogAddress.branch_name;
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

    elements.form.receiver.nombreInput.value = soShippingAddress?.attention ?? '';		//contactInformation.fullName
    elements.form.receiver.empresaInput.value = contact.contactFromAPI?.company_name ?? '';		//contactInformation.companyName
    elements.form.receiver.paisInput.value = 'Mexico';								//postalAddress.countryName *Debemos agregar postalAddress.countryCode = MX

    const parsedAddr = parseAddress(soShippingAddress.address);

    const originalAddressEl = document.getElementById('receiverOriginalAddress');

    if (originalAddressEl && appData.rawData.soShippingAddress) {
        originalAddressEl.textContent = appData.rawData.soShippingAddress.address;
    }

    elements.form.receiver.calleInput.value = parsedAddr?.street ?? '';  // Asumiendo que ahora tienes 'calleInput'
    elements.form.receiver.numeroInput.value = parsedAddr?.number ?? ''; // y 'numeroInput' en tu objeto 'elements'

    // elements.form.receiver.direccionInput.value = soShippingAddress.address;		//postalAddress.addressLine1
    elements.form.receiver.direccion2Input.value = soShippingAddress?.street2 ?? '';		//postalAddress.addressLine2
    elements.form.receiver.direccion3Input.value = '';
    elements.form.receiver.codigoPostalInput.value = soShippingAddress?.zip ?? '';		//postalAddress.postalCode
    elements.form.receiver.ciudadInput.value = soShippingAddress?.city ?? '';				//postalAddress.cityName
    elements.form.receiver.estadoInput.value = soShippingAddress?.state ?? '';			//postalAddress.provinceName
    elements.form.receiver.emailInput.value = contact.soContactPerson?.email ?? '';				//contactInformation.email
    elements.form.receiver.telefonoInput.value = soShippingAddress?.phone ?? '';			//contactInformation.phone

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