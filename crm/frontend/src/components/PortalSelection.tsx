import { Users, Briefcase } from 'lucide-react';

const PortalSelection = () => {
    const handlePortalSelect = (portalType: 'client' | 'employee') => {
        if (portalType === 'client') {
            window.location.href = '/client/login';
        } else {
            window.location.href = '/employee/login';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-casa-blue mb-4">
                        Casa Community
                    </h1>
                    <p className="text-xl text-gray-600">
                        NDIS Support Services
                    </p>
                    <p className="text-lg text-gray-500 mt-2">
                        Please select your portal to continue
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                    {/* Client Portal */}
                    <div
                        onClick={() => handlePortalSelect('client')}
                        className="card hover:shadow-lg cursor-pointer transition-all duration-200 hover:scale-105 text-center p-8"
                    >
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                            For NDIS Participants
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Access your NDIS support services, view your care plan, and manage your appointments
                        </p>
                        <button className="btn-primary w-full" type='button'>
                            Enter Portal
                        </button>
                    </div>

                    {/* Employee Portal */}
                    <div
                        onClick={() => handlePortalSelect('employee')}
                        className="card hover:shadow-lg cursor-pointer transition-all duration-200 hover:scale-105 text-center p-8"
                    >
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Briefcase className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                            For Support Workers
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Manage clients, schedules, and access staff resources and tools
                        </p>
                        <button className="btn-secondary w-full" type='button'>
                            Enter Portal
                        </button>
                    </div>
                </div>

                <div className="text-center mt-8 text-sm text-gray-500">
                    <p>🔒 Secure Login • 📱 Mobile Friendly • 💬 24/7 Support</p>
                </div>
            </div>
        </div>
    );
};

export default PortalSelection;
