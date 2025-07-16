// components/dashboard/sections/DocumentsSection.tsx
import React, { useState, useEffect } from 'react';
import {
    FileText,
    Download,
    CheckCircle,
    Clock,
    AlertCircle,
    ExternalLink,
    Shield,
    Users,
    Calendar
} from 'lucide-react';
// import { useAuth } from '../../../hooks/useAuth';
import { zohoService } from '../../../services/ZohoServices';
import type{ ServiceAgreement } from '../../../types/zoho.types';
import ServiceAgreementSigning from '../../documents/ServiceAgreementSigning';

interface DocumentsSectionProps {
    completionPercentage: number;
    participantProfile: any;
    onNavigate: (section: string) => void;
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({
    completionPercentage,
    participantProfile,
    onNavigate
}) => {
    // const { user } = useAuth();
    const [serviceAgreements, setServiceAgreements] = useState<ServiceAgreement[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSigning, setShowSigning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (completionPercentage === 100) {
            loadServiceAgreements();
        } else {
            setLoading(false);
        }
    }, [completionPercentage]);

    const loadServiceAgreements = async () => {
        try {
            setLoading(true);
            const response = await zohoService.listServiceAgreements();
            setServiceAgreements(response.agreements);
        } catch (error: any) {
            console.error('Failed to load service agreements:', error);
            setError('Failed to load documents');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAgreement = () => {
        setShowSigning(true);
    };

    const handleAgreementComplete = () => {
        setShowSigning(false);
        loadServiceAgreements(); // Refresh the list
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            'NOT_STARTED': { color: 'gray', icon: Clock, text: 'Not Started' },
            'PENDING_SIGNATURE': { color: 'yellow', icon: Clock, text: 'Pending Signature' },
            'SIGNED': { color: 'green', icon: CheckCircle, text: 'Signed' },
            'COMPLETED': { color: 'green', icon: CheckCircle, text: 'Completed' },
            'DECLINED': { color: 'red', icon: AlertCircle, text: 'Declined' }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.NOT_STARTED;
        const IconComponent = config.icon;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                ${config.color === 'gray' ? 'bg-gray-100 text-gray-800' : ''}
                ${config.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' : ''}
                ${config.color === 'green' ? 'bg-green-100 text-green-800' : ''}
                ${config.color === 'red' ? 'bg-red-100 text-red-800' : ''}
            `}>
                <IconComponent className="w-3 h-3 mr-1" />
                {config.text}
            </span>
        );
    };

    const downloadDocument = async (requestId: string) => {
        try {
            const blob = await zohoService.downloadSignedDocument(requestId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `service_agreement_${requestId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Failed to download document:', error);
            alert('Failed to download document. Please try again.');
        }
    };

    if (showSigning) {
        return (
            <ServiceAgreementSigning
                participantProfile={participantProfile}
                onComplete={handleAgreementComplete}
                onCancel={() => setShowSigning(false)}
            />
        );
    }

    if (completionPercentage < 100) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <FileText className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        Complete Profile First
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Complete your profile ({completionPercentage}%) to access documents and create your service agreement.
                    </p>
                    <button
                        onClick={() => onNavigate("profile")}
                        className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                    >
                        <Users className="w-5 h-5 mr-2" />
                        Complete Profile
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
                        <p className="text-gray-600 mt-1">
                            Manage your NDIS service agreements and documents
                        </p>
                    </div>
                    {serviceAgreements.length === 0 && !loading && (
                        <button
                            onClick={handleCreateAgreement}
                            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                        >
                            <Shield className="w-5 h-5 mr-2" />
                            Create Service Agreement
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Loading documents...</span>
                    </div>
                </div>
            ) : error ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="text-center py-12">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Documents</h3>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={loadServiceAgreements}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            ) : serviceAgreements.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <FileText className="w-12 h-12 text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            Ready to Create Your Service Agreement
                        </h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Your profile is complete! Create your NDIS service agreement to begin accessing support services.
                        </p>
                        <button
                            onClick={handleCreateAgreement}
                            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                        >
                            <Shield className="w-5 h-5 mr-2" />
                            Create Service Agreement
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid gap-6">
                    {serviceAgreements.map((agreement) => (
                        <div key={agreement.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            NDIS Service Agreement
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            Participant: {agreement.participant_name}
                                        </p>
                                        <p className="text-gray-500 text-xs">
                                            Created: {new Date(agreement.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                {getStatusBadge(agreement.status)}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 mb-1">Casa Representative</p>
                                    <p className="text-sm font-medium text-gray-900">{agreement.casa_rep_name}</p>
                                    {agreement.casa_rep_signature_date && (
                                        <p className="text-xs text-green-600">
                                            ✓ Signed {new Date(agreement.casa_rep_signature_date).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 mb-1">Client</p>
                                    <p className="text-sm font-medium text-gray-900">{agreement.participant_name}</p>
                                    {agreement.client_signature_date && (
                                        <p className="text-xs text-green-600">
                                            ✓ Signed {new Date(agreement.client_signature_date).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                                {agreement.guardian_name && (
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-xs text-gray-500 mb-1">Guardian</p>
                                        <p className="text-sm font-medium text-gray-900">{agreement.guardian_name}</p>
                                        {agreement.guardian_signature_date && (
                                            <p className="text-xs text-green-600">
                                                ✓ Signed {new Date(agreement.guardian_signature_date).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div className="flex items-center space-x-4">
                                    {agreement.signed_date && (
                                        <div className="flex items-center space-x-2 text-green-600">
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-sm">
                                                Completed: {new Date(agreement.signed_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2">
                                    {(agreement.status === 'SIGNED' || agreement.status === 'COMPLETED') && (
                                        <button
                                            onClick={() => downloadDocument(agreement.zoho_request_id)}
                                            className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                                        >
                                            <Download className="w-4 h-4 mr-1" />
                                            Download PDF
                                        </button>
                                    )}
                                    {agreement.status === 'PENDING_SIGNATURE' && (
                                        <button
                                            onClick={() => setShowSigning(true)}
                                            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                                        >
                                            <ExternalLink className="w-4 h-4 mr-1" />
                                            Continue Signing
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DocumentsSection;
