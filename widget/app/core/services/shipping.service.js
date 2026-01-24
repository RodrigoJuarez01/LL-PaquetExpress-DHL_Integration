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

        const results = await Promise.allSettled(promises);

        const successfulRates = [];
        const errors = [];

        results.forEach(result => {
            if (result.status === 'fulfilled') {
                successfulRates.push(...result.value);
            } else {
                console.warn("Un proveedor falló al cotizar:", result.reason);
                errors.push(result.reason.message);
            }
        });

        if (successfulRates.length === 0) {
            const errorMsg = errors.length > 0 ? errors.join(" | ") : "No se encontraron tarifas disponibles.";
            throw new Error(`Ninguna paquetería pudo cotizar este envío. (${errorMsg})`);
        }

        return successfulRates.sort((a, b) => a.price - b.price);
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

    async cancelShipment(providerName, trackingNumber) {
        const adapter = this._getProvider(providerName);
        return await adapter.cancelShipment(trackingNumber);
    }
};