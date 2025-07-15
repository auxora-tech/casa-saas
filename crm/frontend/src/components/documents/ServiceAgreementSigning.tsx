// components/documents/ServiceAgreementSigning.tsx
import React, { useState, useEffect } from 'react';
// import _ from 'lodash';
import {
    ArrowLeft,
    FileText,
    Shield,
    CheckCircle,
    AlertCircle,
    ExternalLink,
    Clock,
    Users,
    RefreshCw
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { zohoService } from '../../services/ZohoServices';
import type{ ServiceAgreementRequest } from '../../types/zoho.types';

interface ServiceAgreementSigningProps {
    participantProfile: any;
    onComplete: (requestId: string) => void;
    onCancel: () => void;
}

const ServiceAgreementSigning: React.FC<ServiceAgreementSigningProps> = ({
    participantProfile,
    onComplete,
    onCancel
}) => {
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState<'form' | 'signing' | 'complete'>('form');
    const [loading, setLoading] = useState(false);
    const [signingUrl, setSigningUrl] = useState<string | null>(null);
    const [requestId, setRequestId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [guardianRequired, setGuardianRequired] = useState(false);
    const [guardianData, setGuardianData] = useState({
        guardian_name: participantProfile.guardian_name || '',
        guardian_email: participantProfile.guardian_email || '',
        guardian_address: participantProfile.guardian_address || '',
        guardian_contact: participantProfile.guardian_contact || ''
    });

    const checkSigningStatus = async () => {
        if (!requestId) return;

        try {
            const status = await zohoService.checkDocumentStatus(requestId);
            if (status.request_id && (status.status === 'SIGNED' || status.status === 'COMPLETED')) {
                setCurrentStep('complete');
                setTimeout(() => {
                    onComplete(requestId);
                }, 2000);
            }
        } catch (error) {
            console.error('Failed to check status:', error);
        }
    };

    // Poll for completion status every 5 seconds
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (requestId && currentStep === 'signing') {
            interval = setInterval(checkSigningStatus, 5000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [requestId, currentStep]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            console.log(participantProfile);
            const requestData: ServiceAgreementRequest = {
                participant_id: participantProfile?.id || null,
                ...(guardianRequired ? guardianData : {})
            };

            const result = await zohoService.createServiceAgreement(requestData);

            setRequestId(result.zoho_request_id);
            if (result.signing_url) {
                setSigningUrl(result.signing_url);
                setCurrentStep('signing');
            } else {
                throw new Error('No signing URL received');
            }
        } catch (error: any) {
            console.error('Error creating service agreement:', error);
            setError(error.response?.data?.error || 'Failed to create service agreement. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGuardianChange = (field: string, value: string) => {
        setGuardianData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    if (currentStep === 'complete') {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        Service Agreement Completed! 🎉
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Your NDIS service agreement has been successfully signed by all parties.
                        You can now access all support services.
                    </p>
                    <div className="flex justify-center">
                        <div className="animate-pulse">
                            <div className="w-8 h-1 bg-green-500 rounded-full"></div>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-4">Redirecting to documents...</p>
                </div>
            </div>
        );
    }

    if (currentStep === 'signing') {
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={onCancel}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Service Agreement Signing</h2>
                                <p className="text-gray-600">Complete your NDIS service agreement</p>
                            </div>
                        </div>
                        <button
                            onClick={checkSigningStatus}
                            className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Check Status
                        </button>
                    </div>
                </div>

                {/* Signing Interface */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-green-50 border-b border-green-200 p-4">
                        <div className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <div>
                                <p className="text-green-800 font-medium">Agreement Ready for Signature</p>
                                <p className="text-green-700 text-sm">
                                    Please review and sign the document below. All parties will receive email notifications.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Signing Process Info */}
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Signing Process</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                                <div>
                                    <p className="text-sm font-medium text-blue-900">Casa Representative</p>
                                    <p className="text-xs text-blue-700">Signs via email</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border-2 border-green-200">
                                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                                <div>
                                    <p className="text-sm font-medium text-green-900">You (Client)</p>
                                    <p className="text-xs text-green-700">Sign below now</p>
                                </div>
                            </div>
                            {guardianRequired && (
                                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Guardian</p>
                                        <p className="text-xs text-gray-700">Signs via email</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Embedded Signing */}
                    {signingUrl ? (
                        <div className="relative" style={{ height: '700px' }}>
                            <iframe
                                src={signingUrl}
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                title="Service Agreement Signing"
                                className="border-0"
                            />
                            <div className="absolute top-4 right-4">
                                <button
                                    onClick={() => window.open(signingUrl, '_blank')}
                                    className="bg-white shadow-lg border border-gray-200 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg text-sm font-medium flex items-center"
                                >
                                    <ExternalLink className="w-4 h-4 mr-1" />
                                    Open in New Tab
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading signing interface...</p>
                        </div>
                    )}
                </div>

                {/* Help Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                        <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <h4 className="text-blue-900 font-medium">Signing Help</h4>
                            <ul className="text-blue-800 text-sm mt-1 space-y-1">
                                <li>• Follow the prompts in the document to add your signature</li>
                                <li>• Fill in any required fields highlighted in yellow</li>
                                <li>• Click "Finish" when all signatures are complete</li>
                                <li>• You'll receive a copy via email once fully executed</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Form step
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onCancel}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Create Service Agreement</h2>
                        <p className="text-gray-600">Set up your NDIS service agreement for signing</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Participant Information */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Users className="w-5 h-5 mr-2 text-blue-600" />
                        Participant Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={`${user?.first_name} ${user?.last_name}`}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">NDIS Number</label>
                            <input
                                type="text"
                                value={participantProfile.ndis_number || ''}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <input
                                type="text"
                                value={participantProfile.address || ''}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                            />
                        </div>
                    </div>
                </div>

                {/* Guardian Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <Shield className="w-5 h-5 mr-2 text-purple-600" />
                            Guardian/Representative
                        </h3>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={guardianRequired}
                                onChange={(e) => setGuardianRequired(e.target.checked)}
                                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-700">Guardian signature required</span>
                        </label>
                    </div>

                    {guardianRequired && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Name *</label>
                                <input
                                    type="text"
                                    value={guardianData.guardian_name}
                                    onChange={(e) => handleGuardianChange('guardian_name', e.target.value)}
                                    required={guardianRequired}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Full name of guardian"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Email *</label>
                                <input
                                    type="email"
                                    value={guardianData.guardian_email}
                                    onChange={(e) => handleGuardianChange('guardian_email', e.target.value)}
                                    required={guardianRequired}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="guardian@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Contact</label>
                                <input
                                    type="tel"
                                    value={guardianData.guardian_contact}
                                    onChange={(e) => handleGuardianChange('guardian_contact', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="+61 4XX XXX XXX"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Address</label>
                                <textarea
                                    value={guardianData.guardian_address}
                                    onChange={(e) => handleGuardianChange('guardian_address', e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Guardian's residential address"
                                />
                            </div>
                        </div>
                    )}

                    {!guardianRequired && (
                        <div className="text-center py-8 text-gray-500">
                            <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p>No guardian signature required for this agreement</p>
                        </div>
                    )}
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-center space-x-3">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <div>
                                <h4 className="text-red-900 font-medium">Error</h4>
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-medium transition-colors flex items-center"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Creating Agreement...
                            </>
                        ) : (
                            <>
                                <FileText className="w-4 h-4 mr-2" />
                                Create & Sign Agreement
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ServiceAgreementSigning;
