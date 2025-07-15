// types/zoho.types.ts
export interface ServiceAgreementRequest {
    participant_id: number;
    guardian_name?: string;
    guardian_email?: string;
    guardian_address?: string;
    guardian_contact?: string;
}

export interface ServiceAgreementResponse {
    success: boolean;
    service_agreement_id: number;
    zoho_request_id: string;
    signing_url?: string;
    message: string;
    recipients: number;
}

export interface DocumentStatus {
    request_id: string;
    status: 'PENDING_SIGNATURE' | 'SIGNED' | 'DECLINED' | 'COMPLETED';
    actions: Array<{
        action_id: string;
        recipient_email: string;
        action_status: string;
        action_time?: string;
    }>;
}

export interface ServiceAgreement {
    id: number;
    participant_name: string;
    status: 'NOT_STARTED' | 'PENDING_SIGNATURE' | 'SIGNED' | 'COMPLETED' | 'DECLINED';
    created_at: string;
    signed_date?: string;
    zoho_request_id: string;
    guardian_name?: string;
    casa_rep_name: string;
    client_signature_date?: string;
    casa_rep_signature_date?: string;
    guardian_signature_date?: string;
}

export interface ZohoAuthResponse {
    auth_url: string;
}

export interface ZohoCallbackResponse {
    success: boolean;
    message: string;
    token_data?: any;
}

export interface SigningUrlResponse {
    signing_url: string;
    service_agreement_id: number;
    status: string;
}
