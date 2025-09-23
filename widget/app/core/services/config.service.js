let appConfig = {
    orgId: null,
    inventoryConnectionLinkName: 'inventory_all_1',
    dhlConnectionLinkName: 'dhl_api_conn',
    //inventoryConnectionLinkName = '21924000593971005-785799185-inventory_all_1',
    //dhlConnectionLinkName = '21924000593971005-785799185-dhl_api_conn',

};

export const ConfigService = {

    async init() {
        try {
            const organizationResponse = await ZFAPPS.get('organization');
            appConfig.orgId = organizationResponse.organization.organization_id;
            console.log("ConfigService inicializado. OrgID:", appConfig.orgId);
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
    
    getInventoryConn(){
        return appConfig.inventoryConnectionLinkName;
    }
};