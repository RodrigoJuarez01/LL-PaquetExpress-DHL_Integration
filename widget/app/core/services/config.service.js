let appConfig = {
    orgId: null,
    inventoryConnectionLinkName: 'inventory_all_1',
    dhlConnectionLinkName: 'dhl_api_conn',
    //inventoryConnectionLinkName = '21924000593971005-785799185-inventory_all_1',
    //dhlConnectionLinkName = '21924000593971005-785799185-dhl_api_conn',
    salesorderId: null,
    salesorderNumber: null //
};

export const ConfigService = {

    async init() {
        try {
            const organizationResponse = await ZFAPPS.get('organization');
            appConfig.orgId = organizationResponse.organization.organization_id;
            console.log("ConfigService inicializado. OrgID:", appConfig.orgId);

            const salesorderResponse = await ZFAPPS.get('salesorder');

            appConfig.salesorderId = salesorderResponse.salesorder.salesorder_id;
            appConfig.salesorderNumber = salesorderResponse.salesorder.salesorder_number;
            console.log('***Sales Order ID:', appConfig.salesorderId);

        } catch (error) {
            console.error("Error al inicializar ConfigService:", error);
            throw new Error("No se pudo obtener la información de la organización.");
        }
    },


    getOrgId() {
        if (!appConfig.orgId) {

            throw new Error("ConfigService no ha sido inicializado.");
        }
        return appConfig.orgId;
    },
    getSalesOrderID() {
        if (!appConfig.salesorderId) {

            throw new Error("ConfigService no ha sido inicializado.");
        }
        return appConfig.salesorderId;
    },
    getSalesOrderNumber() {
        if (!appConfig.salesorderNumber) {

            throw new Error("ConfigService no ha sido inicializado.");
        }
        return appConfig.salesorderNumber;
    },
    getInventoryConn() {
        return appConfig.inventoryConnectionLinkName;
    }
};