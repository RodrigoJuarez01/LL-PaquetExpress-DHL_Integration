let appConfig = {
    orgId: null,
    apiRootEndPoint: null,
    salesorderId: null,
    salesorderNumber: null,

    pqxBaseUrl: null,
    pqxRatesToken: null,
    pqxUser: null,
    pqxRatesPassword: null,
    pqxTokenGen: null,
    pqxBillClientId: null,

    catalystLabelUrl: null,
    catalystLabelApiKey: null,
    catalystCancelUrl: null,
    catalystCancelApiKey: null,

    // inventoryConnectionLinkName: '21924000872833007-785799185-inventory_all_1_',
    inventoryConnectionLinkName: 'inventory_all_1_',
    dhlConnectionLinkName: 'dhl_api_conn',
    pqxConnName: 'paquetexpress_conn'

};


const VAR_MAPPING = {
    pqxBaseUrl: 'paquetexpress_base_u', //'PAQUETEXPRESS_BASE_URL'
    pqxRatesToken: 'paquetexpress_rates_',//'PAQUETEXPRESS_RATES_TOKEN'
    pqxUser: 'paquexpress_user',//'PAQUETEXPRESS_USER'
    pqxRatesPassword: 'paquetexpress_rates__1',//'PAQUETEXPRESS_RATES_PASSWORD'
    pqxTokenGen: 'paquetexpress_token',//'PAQUETEXPRESS_TOKEN'
    pqxBillClientId: 'paquetexpress_billcl',//'PAQUETEXPRESS_BILLCLNTID'

    catalystLabelUrl: 'catalyst_label_from_',//'CATALYST_LABEL_FROM_PAQUETEXPRESS_URL'
    catalystLabelApiKey: 'catalyst_label_from__1',//'CATALYST_LABEL_FROM_PAQUETEXPRESS_API_KEY'
    catalystCancelUrl: 'catalyst_cancel_paqu',//'CATALYST_CANCEL_PAQUETEXPRESS_SHIPMENT_URL'
    catalystCancelApiKey: 'catalyst_cancel_paqu_1',//'CATALYST_CANCEL_PAQUETEXPRESS_SHIPMENT_API_KEY'
};

export const ConfigService = {

    async init() {
        try {
            const organizationResponse = await ZFAPPS.get('organization');
            const orgDetails = organizationResponse.organization;

            appConfig.orgId = orgDetails.organization_id;
            appConfig.apiRootEndPoint = orgDetails.api_root_endpoint;

            console.log("ConfigService: OrgID detectado:", appConfig.orgId);

            await this._fetchGlobalVariables(orgDetails);
            console.log("ConfigService: Variables globales cargadas.");

            const salesorderResponse = await ZFAPPS.get('salesorder');
            appConfig.salesorderId = salesorderResponse.salesorder.salesorder_id;
            appConfig.salesorderNumber = salesorderResponse.salesorder.salesorder_number;

        } catch (error) {
            console.error("Error crítico en ConfigService.init():", error);
            throw error;
        }
    },


    async _fetchGlobalVariables(orgDetails) {
        const orgId = orgDetails.organization_id;

        const globalFieldCode =
            (orgId == '808492068') ? 'obbuaq' :
                (orgId == '785799185') ? 'prtyo1' :
                    '';

        const keysToFetch = Object.keys(VAR_MAPPING);

        const promises = keysToFetch.map(configKey => {
            const sigmaSuffix = VAR_MAPPING[configKey];

            const placeholder = `vl__com_${globalFieldCode}_${sigmaSuffix}`;

            const options = {
                url: `${appConfig.apiRootEndPoint}/settings/orgvariables/${placeholder}`,
                method: 'GET',
                connection_link_name: appConfig.inventoryConnectionLinkName,
                url_query: [
                    { key: 'organization_id', value: appConfig.orgId }
                ]
            };

            return ZFAPPS.request(options);
        });

        const results = await Promise.all(promises);

        results.forEach((response, index) => {
            const configKey = keysToFetch[index];

            try {
                const body = JSON.parse(response.data.body);
                if (body.code === 0 && body.orgvariable) {
                    appConfig[configKey] = body.orgvariable.value;
                } else {
                    console.warn(`No se pudo leer la variable ${configKey}`, body);
                }
            } catch (e) {
                console.error(`Error parseando variable ${configKey}`, e);
            }
        });
    },

    getOrgId() { return appConfig.orgId; },
    getSalesOrderNumber() { return appConfig.salesorderNumber; },
    getSalesOrderID() {
        if (!appConfig.salesorderId) {

            throw new Error("ConfigService no ha sido inicializado.");
        }
        return appConfig.salesorderId;
    },
    getInventoryConn() { return appConfig.inventoryConnectionLinkName; },
    getDhlConn() { return appConfig.dhlConnName; },
    getPqxConn() { return appConfig.pqxConnName; },


    getPqxBaseUrl() { return appConfig.pqxBaseUrl; },
    getPqxUser() { return appConfig.pqxUser; },

    getPqxRatesToken() { return appConfig.pqxRatesToken; },
    getPqxRatesPassword() { return appConfig.pqxRatesPassword; },
    getPqxTokenGen() { return appConfig.pqxTokenGen; },
    getPqxBillClientId() { return appConfig.pqxBillClientId; },

    getCatalystLabelUrl() { return appConfig.catalystLabelUrl; },
    getCatalystLabelApiKey() { return appConfig.catalystLabelApiKey; },

    getCatalystCancelUrl() { return appConfig.catalystCancelUrl; },
    getCatalystCancelApiKey() { return appConfig.catalystCancelApiKey; }
};