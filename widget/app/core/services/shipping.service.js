import { DhlAdapter } from '../providers/dhl/adapter.js';

const providers = {
    dhl: new DhlAdapter(),
    // paquetexpress: new PaquetexpressAdapter() 
};

export const ShippingService = {

    async getRates(providerName, formData) {
        if (providers[providerName]) {
            return await providers[providerName].getRates(formData);
        } else {
            throw new Error(`La paquetería '${providerName}' no está soportada.`);
        }
    },

    // FUNCIÓN FUTURA en ShippingService
    async getAllRates(formData) {
        const promises = Object.values(providers).map(provider => provider.getRates(formData));
        const results = await Promise.all(promises);

        // return combinedAndSortedRates;
        return ;
    },

    async createShipment(providerName, formData, selectedRateData){
        return await providers[providerName].createShipment(formData, selectedRateData);
    },

    async trackShipment(providerName, trackingNumber){
        return await providers[providerName].trackShipment(trackingNumber);
    }
    
};