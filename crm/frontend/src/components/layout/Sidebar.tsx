// components/layout/Sidebar.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    X,
    Home,
    User,
    FileText,
    Calendar,
    MessageCircle,
    LogOut,
    Shield
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    activeSection: string;
    onSectionChange: (section: string) => void;
}

const navigationItems = [
    { id: "home", label: "Dashboard", icon: Home, description: "Overview and quick actions" },
    { id: "profile", label: "Profile", icon: User, description: "Complete your information" },
    { id: "documents", label: "Documents", icon: FileText, description: "Service agreements & forms" },
    { id: "schedule", label: "Schedule", icon: Calendar, description: "Appointments & sessions" },
    { id: "chat", label: "Messages", icon: MessageCircle, description: "Support team chat" },
];

const Sidebar: React.FC<SidebarProps> = ({
    isOpen,
    onClose,
    activeSection,
    onSectionChange
}) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/client/login/');
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const handleNavigationClick = (sectionId: string) => {
        onSectionChange(sectionId);
        onClose();
    };

    return (
        <div
            className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-dodo-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
        >
            {/* Header */}
            <div className="flex items-center justify-between h-16 px-6 border-b border-dodo-gray/20 dodo-gradient">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-dodo-black" />
                    </div>
                    <div>
                        <h2 className="text-lg font-heading font-bold text-white">Casa Community</h2>
                        <p className="text-xs text-dodo-cream font-body">NDIS Support Portal</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="lg:hidden p-2 rounded-md text-white hover:bg-white hover:bg-opacity-20 transition-colors"
                    aria-label="Close navigation"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                <div className="mb-6">
                    <h3 className="px-3 text-xs font-subheading font-semibold text-dodo-gray uppercase tracking-wider">
                        Navigation
                    </h3>
                </div>

                {navigationItems.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = activeSection === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => handleNavigationClick(item.id)}
                            className={`w-full group flex items-start px-4 py-3 text-left rounded-xl transition-all duration-200 ${isActive
                                    ? "bg-gradient-to-r from-dodo-cream to-dodo-cream/50 text-dodo-black border border-dodo-gray/20 shadow-sm"
                                    : "text-dodo-gray hover:bg-dodo-cream/30 hover:text-dodo-black"
                                }`}
                        >
                            <IconComponent
                                className={`w-5 h-5 mr-3 mt-0.5 transition-colors ${isActive ? "text-dodo-black" : "text-dodo-gray group-hover:text-dodo-black"
                                    }`}
                            />
                            <div className="flex-1 min-w-0">
                                <p className={`font-medium truncate font-body ${isActive ? "text-dodo-black" : "text-dodo-black"
                                    }`}>
                                    {item.label}
                                </p>
                                <p className={`text-xs truncate font-body ${isActive ? "text-dodo-gray" : "text-dodo-gray"
                                    }`}>
                                    {item.description}
                                </p>
                            </div>
                            {isActive && (
                                <div className="w-2 h-2 bg-dodo-black rounded-full mt-2"></div>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="border-t border-dodo-gray/20 p-4">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 text-left rounded-xl text-dodo-red hover:bg-red-50 hover:text-red-700 transition-colors group"
                >
                    <LogOut className="w-5 h-5 mr-3 text-dodo-red group-hover:text-red-700" />
                    <div>
                        <p className="font-medium font-body">Sign Out</p>
                        <p className="text-xs text-dodo-red/70 font-body">Secure logout</p>
                    </div>
                </button>

                {/* Support info */}
                <div className="mt-4 p-3 bg-dodo-cream rounded-lg">
                    <p className="text-xs text-dodo-black font-body mb-1">Need help?</p>
                    <p className="text-xs text-dodo-gray font-body">📞 1800-CASA-HELP</p>
                    <p className="text-xs text-dodo-gray font-body">✉️ help@casa-community.com.au</p>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
