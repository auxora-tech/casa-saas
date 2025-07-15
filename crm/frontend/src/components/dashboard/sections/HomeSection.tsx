// components/dashboard/sections/HomeSection.tsx
import React from 'react';
import {
    CheckCircle,
    AlertCircle,
    ArrowRight,
    User,
    Calendar,
    FileText,
    Activity,
    Shield,
    Clock,
    MessageCircle
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';

interface HomeSectionProps {
    completionPercentage: number;
    profilePicturePreview: string | null;
    participantProfile: any;
    onNavigate: (section: string) => void;
}

const HomeSection: React.FC<HomeSectionProps> = ({
    completionPercentage,
    profilePicturePreview,
    participantProfile,
    onNavigate
}) => {
    const { user } = useAuth();

    const quickActions = [
        {
            id: 'profile',
            title: 'Complete Profile',
            description: 'Finish setting up your participant information',
            icon: User,
            color: 'blue',
            show: completionPercentage < 100
        },
        {
            id: 'documents',
            title: 'Service Agreement',
            description: 'Sign your NDIS service agreement',
            icon: FileText,
            color: 'green',
            show: completionPercentage === 100
        },
        {
            id: 'schedule',
            title: 'View Schedule',
            description: 'Check upcoming appointments',
            icon: Calendar,
            color: 'purple',
            show: true
        },
        {
            id: 'chat',
            title: 'Contact Support',
            description: 'Message your support coordinator',
            icon: MessageCircle,
            color: 'indigo',
            show: true
        }
    ];

    const getColorClasses = (color: string) => {
        const colorMap = {
            blue: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
            green: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
            purple: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
            indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
        };
        return colorMap[color as keyof typeof colorMap] || colorMap.blue;
    };

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-10"></div>
                <div className="absolute top-0 right-0 w-64 h-64 transform translate-x-32 -translate-y-32">
                    <div className="w-full h-full bg-white opacity-10 rounded-full"></div>
                </div>
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-3">
                        Welcome back, {user?.first_name}! 👋
                    </h2>
                    <p className="text-blue-100 text-lg mb-4">
                        Manage your NDIS services and stay connected with your support team.
                    </p>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <Shield className="w-5 h-5 text-blue-200" />
                            <span className="text-sm text-blue-200">Secure Portal</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Clock className="w-5 h-5 text-blue-200" />
                            <span className="text-sm text-blue-200">24/7 Support</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-start space-x-6 mb-6">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden shadow-inner">
                                {profilePicturePreview ? (
                                    <img
                                        src={profilePicturePreview}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="w-10 h-10 text-gray-400" />
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 mb-1">
                                    {participantProfile.preferred_name ||
                                        `${user?.first_name} ${user?.last_name}`}
                                </h3>
                                <p className="text-gray-600 mb-1">{user?.work_email}</p>
                                {participantProfile.ndis_number && (
                                    <div className="inline-flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
                                        <Shield className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm font-medium text-blue-700">
                                            NDIS: {participantProfile.ndis_number}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Profile Completion */}
                        <div className="bg-gray-50 rounded-xl p-4 mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                    <Activity className="w-5 h-5 text-gray-600" />
                                    <span className="font-semibold text-gray-900">
                                        Profile Completion
                                    </span>
                                </div>
                                <span className="text-2xl font-bold text-gray-900">
                                    {completionPercentage}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                                <div
                                    className={`h-3 rounded-full transition-all duration-500 ${completionPercentage < 50
                                            ? "bg-gradient-to-r from-red-400 to-red-500"
                                            : completionPercentage < 100
                                                ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                                                : "bg-gradient-to-r from-green-400 to-green-500"
                                        }`}
                                    style={{ width: `${completionPercentage}%` }}
                                />
                            </div>
                            <p className="text-sm text-gray-600">
                                {completionPercentage === 100
                                    ? "All required information complete!"
                                    : "Complete your profile to access all services"}
                            </p>
                        </div>

                        {/* Status Alert */}
                        {completionPercentage === 100 ? (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                <div className="flex items-start space-x-3">
                                    <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
                                    <div className="flex-1">
                                        <h4 className="text-green-900 font-semibold mb-1">
                                            Profile Complete! 🎉
                                        </h4>
                                        <p className="text-green-700 text-sm mb-3">
                                            All required information is complete. You can now access all services and create your service agreement.
                                        </p>
                                        <button
                                            onClick={() => onNavigate("documents")}
                                            className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors"
                                        >
                                            Access Services
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                <div className="flex items-start space-x-3">
                                    <AlertCircle className="w-6 h-6 text-amber-600 mt-0.5" />
                                    <div className="flex-1">
                                        <h4 className="text-amber-900 font-semibold mb-1">
                                            Complete Your Profile
                                        </h4>
                                        <p className="text-amber-700 text-sm mb-3">
                                            Complete all mandatory fields to access NDIS services and create your service agreement.
                                        </p>
                                        <button
                                            onClick={() => onNavigate("profile")}
                                            className="inline-flex items-center bg-amber-600 hover:bg-amber-700 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors"
                                        >
                                            Complete Profile
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                    {quickActions
                        .filter(action => action.show)
                        .map((action) => {
                            const IconComponent = action.icon;
                            return (
                                <button
                                    key={action.id}
                                    onClick={() => onNavigate(action.id)}
                                    className={`w-full p-4 rounded-xl border text-left transition-all duration-200 transform hover:scale-105 ${getColorClasses(action.color)}`}
                                >
                                    <div className="flex items-start space-x-3">
                                        <IconComponent className="w-6 h-6 mt-0.5" />
                                        <div className="flex-1">
                                            <h4 className="font-semibold mb-1">{action.title}</h4>
                                            <p className="text-sm opacity-80">{action.description}</p>
                                        </div>
                                        <ArrowRight className="w-5 h-5 opacity-60" />
                                    </div>
                                </button>
                            );
                        })}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">Profile created and in progress</span>
                        <span className="text-xs text-gray-500 ml-auto">Today</span>
                    </div>
                    {completionPercentage > 50 && (
                        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-gray-700">Profile progress: {completionPercentage}%</span>
                            <span className="text-xs text-gray-500 ml-auto">Today</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomeSection;
