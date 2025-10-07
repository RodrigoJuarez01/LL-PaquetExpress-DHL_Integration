import { DhlAdapter } from '../providers/dhl/adapter.js';
import { PaquetexpressAdapter } from '../providers/paquetexpress/adapter.js';

const providers = {
    dhl: new DhlAdapter(),
    paquetexpress: new PaquetexpressAdapter()
};

export const ShippingService = {

    async getRates(providerName, formData) {
        if (providers[providerName]) {
            return await providers[providerName].getRates(formData);
        } else {
            throw new Error(`La paquetería '${providerName}' no está soportada.`);
        }
    },

    async getAllRates(formData) {
        const promises = Object.values(providers).map(provider => provider.getRates(formData));

        const resultsByProvider = await Promise.all(promises);

        const combinedAndSortedRates = resultsByProvider
            .flat() 
            .sort((a, b) => a.price - b.price); 

        return combinedAndSortedRates;
    },


    async createShipment(providerName, formData, selectedRateData) {
        return await providers[providerName].createShipment(formData, selectedRateData);
    },

    async trackShipment(providerName, trackingNumber) {
        return await providers[providerName].trackShipment(trackingNumber);
    },

    async getProofOfDelivery(providerName, trackingNumber) {
        return await providers[providerName].getProofOfDelivery(trackingNumber);
    }
};