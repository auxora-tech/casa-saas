// pages/ClientDashboard.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useProfileManagement } from '../hooks/useProfileManagement';
import DashboardLayout from "../components/layout/DashboardLayout";
import HomeSection from "../components/dashboard/sections/HomeSection";
import DocumentsSection from "../components/dashboard/sections/DocumentsSection";
import ScheduleSection from "../components/dashboard/sections/ScheduleSection";
import ChatSection from "../components/dashboard/sections/ChatSection";
import ProfileSection from "../components/dashboard/profile/ProfileSection";

const ClientDashboard: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState("home");

    const {
        participantProfile,
        profilePicturePreview,
        completionPercentage,
        loading,
        handleProfileChange,
        handleProfilePictureChange,
        saveProgressLocally,
        saveProfileToBackend
    } = useProfileManagement(user?.id);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/client/login/');
        }
    }, [isAuthenticated, navigate]);

    const handleNavigationClick = useCallback((sectionId: string) => {
        setActiveSection(sectionId);
    }, []);

    const renderActiveSection = () => {
        switch (activeSection) {
            case "home":
                return (
                    <HomeSection
                        completionPercentage={completionPercentage}
                        profilePicturePreview={profilePicturePreview}
                        participantProfile={participantProfile}
                        onNavigate={handleNavigationClick}
                    />
                );
            case "profile":
                return (
                    <ProfileSection
                        participantProfile={participantProfile}
                        profilePicturePreview={profilePicturePreview}
                        completionPercentage={completionPercentage}
                        loading={loading}
                        onProfileChange={handleProfileChange}
                        onProfilePictureChange={handleProfilePictureChange}
                        onSaveLocally={saveProgressLocally}
                        onSaveToBackend={saveProfileToBackend}
                    />
                );
            case "documents":
                return (
                    <DocumentsSection
                        completionPercentage={completionPercentage}
                        participantProfile={participantProfile}
                        onNavigate={handleNavigationClick}
                    />
                );
            case "schedule":
                return <ScheduleSection />;
            case "chat":
                return <ChatSection />;
            default:
                return (
                    <HomeSection
                        completionPercentage={completionPercentage}
                        profilePicturePreview={profilePicturePreview}
                        participantProfile={participantProfile}
                        onNavigate={handleNavigationClick}
                    />
                );
        }
    };

    if (!isAuthenticated || !user) {
        return null; // Will redirect in useEffect
    }

    return (
        <DashboardLayout
            activeSection={activeSection}
            onSectionChange={handleNavigationClick}
            completionPercentage={completionPercentage}
        >
            {renderActiveSection()}
        </DashboardLayout>
    );
};

export default ClientDashboard;
