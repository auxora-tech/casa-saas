import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, Shield, Clock, MessageCircle } from 'lucide-react';

const PortalSelection: React.FC = () => {
    const navigate = useNavigate();

    const handlePortalSelect = (portalType: 'client' | 'employee') => {
        if (portalType === 'client') {
            navigate('/client/login');
        } else {
            navigate('/employee/signin');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-6xl w-full">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="mb-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <Shield className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-5xl font-bold casa-text-gradient mb-4">
                            Casa Community
                        </h1>
                        <p className="text-2xl text-gray-600 font-medium mb-2">
                            NDIS Support Services
                        </p>
                        <p className="text-lg text-gray-500">
                            Empowering lives through quality disability support
                        </p>
                    </div>

                    {/* Features Banner */}
                    <div className="flex justify-center items-center space-x-8 mb-8">
                        <div className="flex items-center space-x-2 text-gray-600">
                            <Shield className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-medium">Secure Portal</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                            <Clock className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium">24/7 Support</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                            <MessageCircle className="w-5 h-5 text-purple-600" />
                            <span className="text-sm font-medium">Easy Communication</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 inline-block">
                        <p className="text-gray-700 font-medium">
                            Please select your portal to continue
                        </p>
                    </div>
                </div>

                {/* Portal Cards */}
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Client Portal */}
                    <div
                        onClick={() => handlePortalSelect('client')}
                        className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                    >
                        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 text-center hover:shadow-2xl hover:border-blue-200 transition-all duration-300">
                            <div className="relative mb-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300">
                                    <Users className="w-10 h-10 text-blue-600" />
                                </div>
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <span className="text-white text-xs">→</span>
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                NDIS Participants
                            </h3>

                            <p className="text-gray-600 mb-6 leading-relaxed">
                                Access your NDIS support services, view your care plan, manage appointments, and stay connected with your support team.
                            </p>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span>Service Agreements</span>
                                </div>
                                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span>Support Scheduling</span>
                                </div>
                                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span>Progress Tracking</span>
                                </div>
                            </div>

                            <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg group-hover:scale-105">
                                Enter Participant Portal
                            </button>
                        </div>
                    </div>

                    {/* Employee Portal */}
                    <div
                        onClick={() => handlePortalSelect('employee')}
                        className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                    >
                        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 text-center hover:shadow-2xl hover:border-green-200 transition-all duration-300">
                            <div className="relative mb-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:from-green-200 group-hover:to-green-300 transition-all duration-300">
                                    <Briefcase className="w-10 h-10 text-green-600" />
                                </div>
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <span className="text-white text-xs">→</span>
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                Support Workers
                            </h3>

                            <p className="text-gray-600 mb-6 leading-relaxed">
                                Manage clients, access schedules, complete documentation, and utilize staff resources and professional development tools.
                            </p>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>Client Management</span>
                                </div>
                                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>Shift Scheduling</span>
                                </div>
                                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>Documentation Tools</span>
                                </div>
                            </div>

                            <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg group-hover:scale-105">
                                Enter Staff Portal
                            </button>
                        </div>
                    </div>
                </div>

                {/* Support Information */}
                <div className="text-center mt-16">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-2xl mx-auto">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                            Need Help Getting Started?
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="flex items-center justify-center space-x-2">
                                <span className="text-2xl">📞</span>
                                <div>
                                    <p className="font-medium">Call Support</p>
                                    <p>1800-CASA-HELP</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-center space-x-2">
                                <span className="text-2xl">✉️</span>
                                <div>
                                    <p className="font-medium">Email Support</p>
                                    <p>help@casa-community.com.au</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-xs text-gray-500">
                                Available Monday to Friday, 8:00 AM - 6:00 PM AEST
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-sm text-gray-500">
                    <p>
                        © 2025 Casa Community Pty Ltd. All rights reserved. |
                        <span className="mx-1">ABN: XX XXX XXX XXX</span> |
                        <span className="mx-1">NDIS Registered Provider</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PortalSelection;
