
// let warehouses = [];
// let packagesAndWarehouse = [];
// let groupedPackagesByShipment = {}; // Esto se requiere en pestaña de tracking 
// let groupedPackages = {};

const inventoryConnectionLinkName = 'inventory_all_1';
const dhlConnectionLinkName = 'dhl_api_conn';
//const inventoryConnectionLinkName = '21924000593971005-785799185-inventory_all_1';
//const dhlConnectionLinkName = '21924000593971005-785799185-dhl_api_conn';


async function _fetchRawData() {
    let errors = [];
    try {

        const organizationResponse = await ZFAPPS.get('organization');
        const orgId = organizationResponse.organization.organization_id;

        console.log('***Organization ID:', orgId);

        const dhlUrlComplement = orgId == '808492068' ? '/test' : '';

        console.log('***dhlUrlComplement:', dhlUrlComplement);

        const salesorderResponse = await ZFAPPS.get('salesorder');
        const salesorderId = salesorderResponse.salesorder.salesorder_id; //
        const salesorderNumber = salesorderResponse.salesorder.salesorder_number; //
        console.log('***Sales Order ID:', salesorderId);

        const warehousesOptions = {
            url: 'https://www.zohoapis.com/inventory/v1/settings/warehouses?organization_id=' + orgId,
            method: "GET",
            connection_link_name: inventoryConnectionLinkName
        };
        const werehousesAPIResponse = await ZFAPPS.request(warehousesOptions);

        const werehousesBody = JSON.parse(werehousesAPIResponse.data.body);

        const salesordersOptions = {
            url: 'https://www.zohoapis.com/inventory/v1/salesorders/' + salesorderId + '?organization_id=' + orgId,
            method: "GET",
            connection_link_name: inventoryConnectionLinkName
        };

        const sordersAPIResponse = await ZFAPPS.request(salesordersOptions);

        const salesOrdersBody = JSON.parse(sordersAPIResponse.data.body);

        const soContactPerson = salesOrdersBody.salesorder.contact_person_details[0];

        const soCustomerId = salesOrdersBody.salesorder.customer_id;
        const packagesFromSalesOrder = salesOrdersBody.salesorder.packages;
        const soShippingAddress = salesOrdersBody.salesorder.shipping_address;

        console.log(salesOrdersBody.salesorder.contact_person_details[0].email);

        const contactsOptions = {
            url: 'https://www.zohoapis.com/inventory/v1/contacts/' + soCustomerId + '?organization_id=' + orgId,
            method: "GET",
            connection_link_name: inventoryConnectionLinkName
        };

        const contactsAPIResponse = await ZFAPPS.request(contactsOptions);
        const contactsBody = JSON.parse(contactsAPIResponse.data.body);
        console.log('contacts Body: ');
        console.log(contactsBody);

        const contactFromAPI = contactsBody.contact;

        // let packagesFullData = [];

        // for (const packageItem of packagesFromSalesOrder) {
        //     let packageId = packageItem.package_id;

        //     const packageOptions = {
        //         url: 'https://www.zohoapis.com/inventory/v1/packages/' + packageId + '?organization_id=' + orgId,
        //         method: 'GET',
        //         connection_link_name: inventoryConnectionLinkName
        //     };

        //     const packageAPIResponse = await ZFAPPS.request(packageOptions);
        //     console.log('Package API response value for package ID:', packageId);
        //     console.log(packageAPIResponse);

        //     const packageBody = JSON.parse(packageAPIResponse.data.body);
        //     console.log('packageAPIResponse body: ');
        //     console.log(packageBody);

        //     packagesFullData.push(packageBody.package);
        //     console.log('+packagesFullData: ');
        //     console.log(packagesFullData);

        // }

        const packagePromises = packagesFromSalesOrder.map(pkg => {
            const packageOptions = {
                url: `https://www.zohoapis.com/inventory/v1/packages/${pkg.package_id}?organization_id=${orgId}`,
                method: 'GET',
                connection_link_name: inventoryConnectionLinkName
            };
            return ZFAPPS.request(packageOptions);
        });

        const packageAPIResponses = await Promise.all(packagePromises);
        const packagesFullData = packageAPIResponses.map(res => JSON.parse(res.data.body).package);


        console.log("*packagesFullData: ", packagesFullData);
        console.log(packagesFullData);

        return {
            warehouses: werehousesBody.warehouses,
            salesOrder: salesOrdersBody.salesorder,
            soShippingAddress: soShippingAddress,
            contact:{
                soContactPerson: soContactPerson,
                contactFromAPI: contactFromAPI,
            },
            packages: packagesFullData,
            errors: errors
        };

    } catch (error) {
        errors.push('Fetching data error: ' + error.message);
        return {
            errors: errors
        }
    }
}

function _processAndGroupData(data) {
    let packagesAndWarehouse = [];
    let groupedPackagesByShipment = {};
    let groupedPackages = {};

    const { warehouses, salesOrder, contact, packages } = data;

    let isSalesOrderPteAlmacenEmpty = false;
    let isPteAlmacenMatched = true;
    let isPackagePteAlmacenEmpty = false;

    const warehouseShouldBeLaboratory = packages.some(
        pck => {
            if (pck.custom_field_hash.hasOwnProperty('cf_num_de_recepcion')) {
                const lowercaseNumRecepcion = pck.custom_field_hash
                    .cf_num_de_recepcion.trim().toLowerCase();

                if (salesOrder.custom_field_hash
                    .hasOwnProperty('cf_pte_almacen')) {

                    const pteAlmacenFromSalesOrder = salesOrder.custom_field_hash.cf_pte_almacen;
                    const pteAlmacenContainsCEDIS = pteAlmacenFromSalesOrder
                        .includes('CEDIS');
                    const isNumRecepcionAut7 = lowercaseNumRecepcion == 'aut_7';
                    return isNumRecepcionAut7 && pteAlmacenContainsCEDIS;

                } else {
                    return false;
                }
            } else {
                return false;
            }
        });

    console.log('warehouseShouldBeLaboratory: ', warehouseShouldBeLaboratory);

    let isAuthorizedWarehouse = false;
    if (salesOrder.custom_field_hash.cf_pte_almacen && salesOrder.custom_field_hash.cf_pte_almacen.trim() !== '') {
        const pteAlmacen = salesOrder.custom_field_hash.cf_pte_almacen.trim();
        if (pteAlmacen.includes('VENTAS') || pteAlmacen.includes('CEDIS')) {
            isAuthorizedWarehouse = true;
        }
    }


    /* 
    This code iterates over an array of packages and warehouses to join them based on a matching key. 
    The joined packages and warehouses are then pushed into a new array called packagesAndWarehouse. 
    */
    packages.forEach(pck => {
        //let key = package.custom_field_hash.cf_pte_almacen;
        /*
        This code is responsible for retrieving the value of cf_pte_almacen from the package data.
        However, it is currently not possible to obtain this value from the package data as some packages have it empty.
        Therefore, as per José Crorona's request, the value of cf_pte_almacen should be taken from the sales order instead.
        */
        let key;
        if (salesOrder.custom_field_hash
            .hasOwnProperty('cf_pte_almacen')) {
            key = salesOrder.custom_field_hash.cf_pte_almacen;
            key = key.trim();
        }
        console.log('key: ', key);

        if (warehouseShouldBeLaboratory) {
            key = 'DCA Ventas PE LL/DC';
        }

        if (!key || key == 'null') {
            isPackagePteAlmacenEmpty = true;
            isSalesOrderPteAlmacenEmpty = true;
            //packagesWithPteAlmacenEmpty.push(package.package_number);
        }

        warehouses.forEach(warehouse => {
            if (warehouse.warehouse_name.trim() === key) {
                let obj = {
                    warehouse_name: warehouse.warehouse_name,
                    zip: warehouse.zip,
                    address: warehouse.address,
                    address2: warehouse.address2,
                    address1: warehouse.address1,
                    phone: warehouse.phone,
                    attention: warehouse.attention,
                    state: warehouse.state,
                    city: warehouse.city,
                    branch_name: warehouse.branch_name,
                    email: warehouse.email,
                    warehouse_id: warehouse.warehouse_id,
                    pte_almacen: key,
                    package_id: pck.package_id,
                    package_number: pck.package_number,
                    customer_id: pck.customer_id,
                    shipment_id: pck.shipment_id,
                    shipment_number: pck.shipment_number,
                    shipment_status: pck.shipment_order.shipment_status,
                    shipment_tracking_number: pck.shipment_order.tracking_number,
                };

                packagesAndWarehouse.push(obj);
            }
        });
    });

    console.log('*Joined packages: ');
    console.log(packagesAndWarehouse);
    if (packagesAndWarehouse.length === 0) {
        isPteAlmacenMatched = false;
    }

    /*
    This code creates a new array to store grouped packages by tracking number.
    It iterates over the packagesAndWarehouse array and groups the packages based on their tracking number.
    The grouped packages are stored in the groupedPackagesByShipment object.
    */
    // Iterate over the packagesAndWarehouse array
    packagesAndWarehouse.forEach(pck => {
        // Get the shipment number of the package
        const trackingNumber = pck.shipment_tracking_number || 'notShipped';

        // Check if the shipment number already exists in groupedPackagesByShipment
        if (!groupedPackagesByShipment[trackingNumber]) {
            // If it doesn't exist, create a new array for that shipment number
            groupedPackagesByShipment[trackingNumber] = [];
        }

        // Push the package into the corresponding shipment number array
        groupedPackagesByShipment[trackingNumber].push(pck);
    });

    console.log('*Grouped packages by tracking number:');
    console.log(groupedPackagesByShipment);

    /* 
        This code snippet groups packages based on their warehouse ID.
        It iterates over the 'packagesAndWarehouse' array and creates a new array 'groupedPackages' 
        where each package is grouped under its corresponding warehouse ID.
        If a warehouse ID does not exist in 'groupedPackages', a new array is created for that warehouse ID.
    */
    packagesAndWarehouse.forEach(pck => {
        let warehouseId = pck.warehouse_id;
        if (!groupedPackages[warehouseId]) {
            groupedPackages[warehouseId] = [];
        }

        if (pck.shipment_status !== "delivered" && !pck.shipment_tracking_number) {
            groupedPackages[warehouseId].push(pck);
        }

        //groupedPackages[warehouseId].push(package);
    });

    console.log('*Grouped packages:');
    console.log(groupedPackages);
    const groupedPackagesKeys = Object.keys(groupedPackages);
    const groupedPackagesKeysSize = groupedPackagesKeys.length;
    console.log('groupedPackagesKeysSize: ', groupedPackagesKeysSize);

    // Remove groupedPackages elements with empty arrays
    for (const key in groupedPackages) {
        if (groupedPackages[key].length === 0) {
            delete groupedPackages[key];
        }
    }
    console.log('groupedPackages after removing empty arrays:', groupedPackages);



    return {
        packagesAndWarehouse,
        groupedPackagesByShipment,
        groupedPackages,
        isSalesOrderPteAlmacenEmpty,
        isPteAlmacenMatched,
        isAuthorizedWarehouse,
        isValid: true
    };
}

function _validateBusinessRules(processedData) {

    let errorMsg = null;
    let isValid = true;

    const { isSalesOrderPteAlmacenEmpty, isPteAlmacenMatched, isAuthorizedWarehouse, groupedPackages } = processedData;

    console.log("groupedPackages", groupedPackages);

    if (Object.keys(groupedPackages).length === 0
        || isSalesOrderPteAlmacenEmpty
        || !isPteAlmacenMatched
        || !isAuthorizedWarehouse) {

        errorMsg = `No es posible generar una guía para los paquetes, ya que todos ellos cuentan con una guía asignada.`;
        if (isSalesOrderPteAlmacenEmpty) {
            //shipmentAlertMessage.innerHTML = `No es posible generar una nueva guía para los paquetes, ya que no se cuenta con información de almacén asignada a alguno de ellos. Por favor, verifique el campo 'PTE Almacén' de los paquetes: `+packagesWithPteAlmacenEmpty.join(', ').replace(/, $/, '')+'.';
            errorMsg = `No es posible generar una guía para los paquetes, ya que no se cuenta con información de almacén asignada a la orden de venta. Por favor, verifique el campo 'PTE Almacén'.`;
        } else if (!isPteAlmacenMatched) {
            errorMsg = `No es posible generar una guía para los paquetes, ya que no se obtuvo una coincidencia entre el valor del campo 'PTE Almacén' de la orden de venta y alguno de los nombres de almacén.`;
        } else if (!isAuthorizedWarehouse) {
            errorMsg = `No es posible generar una guía para los paquetes, ya que el almacén indicado en el campo 'PTE Almacén' no coincide con algún CEDIS o DCA/LLA Ventas.`;
        }
        isValid = false;
    }


    // if (Object.keys(groupedPackages).length === 0
    //     || isSalesOrderPteAlmacenEmpty
    //     || !isPteAlmacenMatched
    //     || !isAuthorizedWarehouse) {

    //     shipmentAlertMessageRow.style.display = 'block';
    //     shipmentAlertMessage.innerHTML = `No es posible generar una guía para los paquetes, ya que todos ellos cuentan con una guía asignada.`;
    //     if (isSalesOrderPteAlmacenEmpty) {
    //         //shipmentAlertMessage.innerHTML = `No es posible generar una nueva guía para los paquetes, ya que no se cuenta con información de almacén asignada a alguno de ellos. Por favor, verifique el campo 'PTE Almacén' de los paquetes: `+packagesWithPteAlmacenEmpty.join(', ').replace(/, $/, '')+'.';
    //         shipmentAlertMessage.innerHTML = `No es posible generar una guía para los paquetes, ya que no se cuenta con información de almacén asignada a la orden de venta. Por favor, verifique el campo 'PTE Almacén'.`;
    //     } else if (!isPteAlmacenMatched) {
    //         shipmentAlertMessage.innerHTML = `No es posible generar una guía para los paquetes, ya que no se obtuvo una coincidencia entre el valor del campo 'PTE Almacén' de la orden de venta y alguno de los nombres de almacén.`;
    //     } else if (!isAuthorizedWarehouse) {
    //         shipmentAlertMessage.innerHTML = `No es posible generar una guía para los paquetes, ya que el almacén indicado en el campo 'PTE Almacén' no coincide con algún CEDIS o DCA/LLA Ventas.`;
    //     }
    //     hideFirstStepElements();
    // }


    return { isValid: isValid, error: errorMsg };
}



const ZohoService = {
    async initializeAppData() {
        try {
            const rawData = await _fetchRawData();
            const processedData = _processAndGroupData(rawData);
            const validationResult = _validateBusinessRules(processedData);

            return {
                data: processedData,
                validation: validationResult,
                rawData: rawData
            };
        } catch (error) {
            console.error("Error en ZohoService:", error);

            return {
                data: null,
                validation: { isValid: false, error: 'Ocurrió un error inesperado al obtener los datos de Zoho.' }
            };
        }
    }
};

export default ZohoService;