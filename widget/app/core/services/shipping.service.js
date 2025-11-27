import { DhlAdapter } from '../providers/dhl/adapter.js';
import { PaquetexpressAdapter } from '../providers/paquetexpress/adapter.js';

const providers = {
    dhl: new DhlAdapter(),
    paquetexpress: new PaquetexpressAdapter()
};

export const ShippingService = {

    _getProvider(providerName) {
        if (!providerName) throw new Error("Nombre de proveedor no proporcionado.");
        
        const key = providerName.trim().toLowerCase(); 
        const provider = providers[key];

        if (!provider) {
            console.error(`Proveedor no encontrado. Recibido: '${providerName}' -> Buscado: '${key}'`);
            throw new Error(`El proveedor '${providerName}' no está configurado o soportado.`);
        }
        return provider;
    },


    async getRates(providerName, formData) {
        const adapter = this._getProvider(providerName);
        return await adapter.getRates(formData);
    },

    async getAllRates(formData) {
        const promises = Object.values(providers).map(provider => provider.getRates(formData));

        const resultsByProvider = await Promise.all(promises);

        const combinedAndSortedRates = resultsByProvider
            .flat() 
            .sort((a, b) => a.price - b.price); 

        return combinedAndSortedRates;
    },

    async createShipment(providerName, formData, selectedRateData, selectedPackageIds) {
        const adapter = this._getProvider(providerName);
        return await adapter.createShipment(formData, selectedRateData, selectedPackageIds);
    },

    async trackShipment(providerName, trackingNumber) {
        const adapter = this._getProvider(providerName);
        return await adapter.trackShipment(trackingNumber);
    },

    async getProofOfDelivery(providerName, trackingNumber, shipmentID) {
        const adapter = this._getProvider(providerName);
        return await adapter.getProofOfDelivery(trackingNumber, shipmentID);
    },
    
    async cancelShipment(providerName, trackingNumber){
        const adapter = this._getProvider(providerName);
        return await adapter.cancelShipment(trackingNumber);
    }
};