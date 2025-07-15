// components/layout/DashboardLayout.tsx
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Sidebar from './Sidebar';
import Header from './Header';

interface DashboardLayoutProps {
    children: React.ReactNode;
    activeSection: string;
    onSectionChange: (section: string) => void;
    completionPercentage?: number;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
    children,
    activeSection,
    onSectionChange,
    completionPercentage = 0
}) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                activeSection={activeSection}
                onSectionChange={onSectionChange}
            />

            {/* Sidebar Overlay for Mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 lg:ml-0">
                <Header
                    user={user}
                    completionPercentage={completionPercentage}
                    onMenuClick={() => setSidebarOpen(true)}
                />

                {/* Main Content Area */}
                <main className="p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
