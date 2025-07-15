// components/layout/Header.tsx
import React from 'react';
import { Menu, Bell, Settings, ChevronDown } from 'lucide-react';

interface HeaderProps {
    user: any;
    completionPercentage: number;
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, completionPercentage, onMenuClick }) => {
    return (
        <header className="bg-white shadow-sm border-b border-dodo-gray/20 sticky top-0 z-30">
            <div className="flex items-center justify-between h-16 px-4 lg:px-6">
                {/* Left Section */}
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 rounded-lg text-dodo-gray hover:text-dodo-black hover:bg-dodo-cream transition-colors"
                        aria-label="Open sidebar"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="hidden lg:block">
                        <h1 className="text-xl font-heading font-bold text-dodo-black">
                            NDIS Portal
                        </h1>
                        <p className="text-sm text-dodo-gray font-body">
                            Welcome back, {user?.first_name}
                        </p>
                    </div>
                </div>

                {/* Center Section - Profile Completion (mobile) */}
                <div className="lg:hidden">
                    <div className="text-center">
                        <p className="text-sm font-medium text-dodo-black font-body">
                            {completionPercentage}% Complete
                        </p>
                        <div className="w-24 bg-dodo-cream rounded-full h-1.5 mt-1">
                            <div
                                className={`h-1.5 rounded-full transition-all duration-300 ${completionPercentage < 50
                                        ? "bg-dodo-red"
                                        : completionPercentage < 100
                                            ? "bg-yellow-500"
                                            : "bg-green-500"
                                    }`}
                                style={{ width: `${completionPercentage}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center space-x-4">
                    {/* Profile Completion (desktop) */}
                    <div className="hidden lg:flex items-center space-x-3">
                        <div className="text-right">
                            <p className="text-sm text-dodo-gray font-body">Profile Completion</p>
                            <div className="flex items-center space-x-2">
                                <div className="w-20 bg-dodo-cream rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 ${completionPercentage < 50
                                                ? "bg-dodo-red"
                                                : completionPercentage < 100
                                                    ? "bg-yellow-500"
                                                    : "bg-green-500"
                                            }`}
                                        style={{ width: `${completionPercentage}%` }}
                                    />
                                </div>
                                <span className="text-sm font-semibold text-dodo-black font-body">
                                    {completionPercentage}%
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Notifications */}
                    <button className="relative p-2 text-dodo-gray hover:text-dodo-black hover:bg-dodo-cream rounded-lg transition-colors">
                        <Bell className="w-5 h-5" />
                        {/* Notification badge */}
                        <span className="absolute top-1 right-1 w-2 h-2 bg-dodo-red rounded-full"></span>
                    </button>

                    {/* Settings */}
                    <button className="p-2 text-dodo-gray hover:text-dodo-black hover:bg-dodo-cream rounded-lg transition-colors" title='settings'>
                        <Settings className="w-5 h-5" />
                    </button>

                    {/* User Profile */}
                    <div className="flex items-center space-x-3 pl-3 border-l border-dodo-gray/20">
                        <div className="w-8 h-8 rounded-full dodo-gradient flex items-center justify-center">
                            <span className="text-white text-sm font-bold font-body">
                                {user?.first_name?.[0]}{user?.last_name?.[0]}
                            </span>
                        </div>

                        <div className="hidden sm:block">
                            <div className="flex items-center space-x-1">
                                <div>
                                    <p className="text-sm font-medium text-dodo-black font-body">
                                        {user?.first_name} {user?.last_name}
                                    </p>
                                    <p className="text-xs text-dodo-gray font-body">
                                        NDIS Participant
                                    </p>
                                </div>
                                <ChevronDown className="w-4 h-4 text-dodo-gray" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
