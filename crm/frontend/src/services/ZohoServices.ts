// services/zohoService.ts
import api from './api';
import type{ 
    ServiceAgreementRequest, 
    ServiceAgreementResponse, 
    DocumentStatus, 
    ServiceAgreement,
    ZohoAuthResponse,
    ZohoCallbackResponse,
    SigningUrlResponse
} from '../types/zoho.types';

export const zohoService = {
    // Initialize Zoho OAuth
    initiateAuth: async (): Promise<ZohoAuthResponse> => {
        const response = await api.get('/documents/zoho/auth/');
        return response.data;
    },

    // Handle OAuth callback
    handleCallback: async (code: string): Promise<ZohoCallbackResponse> => {
        const response = await api.get(`/documents/zoho/callback/?code=${code}`);
        return response.data;
    },

    // Create service agreement
    createServiceAgreement: async (data: ServiceAgreementRequest): Promise<ServiceAgreementResponse> => {
        const response = await api.post('/document/service-agreements/create/', data);
        return response.data;
    },

    // Get signing URL for specific agreement
    getSigningUrl: async (serviceAgreementId: number): Promise<SigningUrlResponse> => {
        const response = await api.get(`/documents/service-agreements/${serviceAgreementId}/signing-url/`);
        return response.data;
    },

    // Check document status
    checkDocumentStatus: async (requestId: string): Promise<DocumentStatus> => {
        const response = await api.get(`/documents/documents/${requestId}/status/`);
        return response.data;
    },

    // Download signed document
    downloadSignedDocument: async (requestId: string): Promise<Blob> => {
        const response = await api.get(`/documents/documents/${requestId}/download/`, {
            responseType: 'blob'
        });
        return response.data;
    },

    // List service agreements
    listServiceAgreements: async (): Promise<{ agreements: ServiceAgreement[] }> => {
        const response = await api.get('/documents/service-agreements/');
        return response.data;
    },

    // Get service agreement details
    getServiceAgreementDetails: async (id: number): Promise<{ agreement: any }> => {
        const response = await api.get(`/documents/service-agreements/${id}/`);
        return response.data;
    }
};

export default zohoService;
