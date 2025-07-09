import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  FileText,
  Calendar,
  MessageCircle,
  User,
  LogOut,
  Camera,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/common/Button";

// Types for better type safety
interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
}

interface ProfileData {
  profilePicture: string | null;
  phone: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  ndisNumber: string;
  dateOfBirth: string;
  preferredLanguage: string;
  medicalInfo: string;
}

interface ProfileCompletion {
  isComplete: boolean;
  completedFields: number;
  totalFields: number;
  missingFields: string[];
}

const ClientDashboard: React.FC = () => {
  // State management
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("home");
  const [profileData, setProfileData] = useState<ProfileData>({
    profilePicture: null,
    phone: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    ndisNumber: "",
    dateOfBirth: "",
    preferredLanguage: "English",
    medicalInfo: "",
  });
  const [profileCompletion, setProfileCompletion] = useState<ProfileCompletion>(
    {
      isComplete: false,
      completedFields: 0,
      totalFields: 8,
      missingFields: [],
    }
  );
  const [loading, setLoading] = useState(false);

  // Hooks
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation items
  const navigationItems: NavigationItem[] = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      isActive: activeSection === "home",
    },
    {
      id: "documents",
      label: "Documents",
      icon: FileText,
      isActive: activeSection === "documents",
    },
    {
      id: "schedule",
      label: "Schedule",
      icon: Calendar,
      isActive: activeSection === "schedule",
    },
    {
      id: "chat",
      label: "Chat",
      icon: MessageCircle,
      isActive: activeSection === "chat",
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
      isActive: activeSection === "profile",
    },
  ];

  // Calculate profile completion on mount and when profile data changes
  useEffect(() => {
    calculateProfileCompletion();
  }, [profileData]);

  // Load user profile data
  useEffect(() => {
    loadUserProfile();
  }, [user]);

  // Calculate profile completion
  const calculateProfileCompletion = useCallback(() => {
    const requiredFields = [
      "phone",
      "address",
      "emergencyContact",
      "emergencyPhone",
      "ndisNumber",
      "dateOfBirth",
      "preferredLanguage",
      "medicalInfo",
    ];

    const completedFields = requiredFields.filter((field) => {
      const value = profileData[field as keyof ProfileData];
      return value && value.toString().trim() !== "";
    });

    const missingFields = requiredFields.filter((field) => {
      const value = profileData[field as keyof ProfileData];
      return !value || value.toString().trim() === "";
    });

    setProfileCompletion({
      isComplete: completedFields.length === requiredFields.length,
      completedFields: completedFields.length,
      totalFields: requiredFields.length,
      missingFields: missingFields.map((field) =>
        field
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())
      ),
    });
  }, [profileData]);

  // Load user profile data (mock implementation)
  const loadUserProfile = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // In real implementation, fetch from API
      // const response = await api.get('/client/profile/');
      // setProfileData(response.data);

      // Mock data for demo
      const savedProfile = localStorage.getItem(`profile_${user.id}`);
      if (savedProfile) {
        setProfileData(JSON.parse(savedProfile));
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Handle navigation item click
  const handleNavigationClick = useCallback((sectionId: string) => {
    setActiveSection(sectionId);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  }, []);

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [logout, navigate]);

  // Handle profile picture upload
  const handleProfilePictureUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setProfileData((prev) => ({
            ...prev,
            profilePicture: result,
          }));
          // Save to localStorage for demo
          const updatedProfile = { ...profileData, profilePicture: result };
          localStorage.setItem(
            `profile_${user?.id}`,
            JSON.stringify(updatedProfile)
          );
        };
        reader.readAsDataURL(file);
      }
    },
    [profileData, user]
  );

  // Handle profile form submission
  const handleProfileSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);

      try {
        // In real implementation, save to API
        // await api.put('/client/profile/', profileData);

        // Save to localStorage for demo
        localStorage.setItem(
          `profile_${user?.id}`,
          JSON.stringify(profileData)
        );

        // Show success message
        alert("Profile updated successfully!");
      } catch (error) {
        console.error("Failed to update profile:", error);
        alert("Failed to update profile. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [profileData, user]
  );

  // Sidebar component
  const Sidebar = () => (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Navigation</h2>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigationClick(item.id)}
              className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
                item.isActive
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
              aria-current={item.isActive ? "page" : undefined}
            >
              <IconComponent className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="border-t border-gray-200 p-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 text-left rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );

  // Home section component
  const HomeSection = () => (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">
          Welcome back, {user?.first_name}! 👋
        </h2>
        <p className="text-blue-100">
          Manage your NDIS services and stay connected with your support team.
        </p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-4 mb-4">
          {/* Profile Picture */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {profileData.profilePicture ? (
                <img
                  src={profileData.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1 cursor-pointer hover:bg-blue-700 transition-colors">
              <Camera className="w-3 h-3 text-white" />
                          <input
                              title="image"
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                className="sr-only"
              />
            </label>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900">
              {user?.first_name} {user?.last_name}
            </h3>
            <p className="text-gray-600">{user?.email}</p>
            <div className="mt-2">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        (profileCompletion.completedFields /
                          profileCompletion.totalFields) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600">
                  {profileCompletion.completedFields}/
                  {profileCompletion.totalFields}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Completion Status */}
        {profileCompletion.isComplete ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
              <div>
                <h4 className="text-green-800 font-medium">
                  Profile Complete! 🎉
                </h4>
                <p className="text-green-700 text-sm mt-1">
                  Your profile has been completed. Now you can get the service
                  agreement. Please go to the document section in the side
                  navigation and get the service agreement.
                </p>
                <Button
                  onClick={() => handleNavigationClick("documents")}
                  className="mt-3 bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2"
                >
                  Go to Documents <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
              <div>
                <h4 className="text-yellow-800 font-medium">
                  Complete Your Profile
                </h4>
                <p className="text-yellow-700 text-sm mt-1">
                  Complete your profile to access all NDIS services and get your
                  service agreement.
                </p>
                <p className="text-yellow-600 text-xs mt-2">
                  Missing: {profileCompletion.missingFields.join(", ")}
                </p>
                <Button
                  onClick={() => handleNavigationClick("profile")}
                  className="mt-3 bg-yellow-600 hover:bg-yellow-700 text-white text-sm px-4 py-2"
                >
                  Complete Profile <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {navigationItems.slice(1).map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigationClick(item.id)}
                className="p-4 text-center border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <IconComponent className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Profile section component
  const ProfileSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Complete Your Profile
        </h2>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your phone number"
                required
              />
            </div>

            {/* NDIS Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NDIS Number *
              </label>
              <input
                type="text"
                value={profileData.ndisNumber}
                onChange={(e) =>
                  setProfileData((prev) => ({
                    ...prev,
                    ndisNumber: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your NDIS number"
                required
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth *
              </label>
                          <input
                              title="date of birth"
                type="date"
                value={profileData.dateOfBirth}
                onChange={(e) =>
                  setProfileData((prev) => ({
                    ...prev,
                    dateOfBirth: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Preferred Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Language *
              </label>
                          <select
                              title="language"
                value={profileData.preferredLanguage}
                onChange={(e) =>
                  setProfileData((prev) => ({
                    ...prev,
                    preferredLanguage: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="Mandarin">Mandarin</option>
                <option value="Arabic">Arabic</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Emergency Contact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Emergency Contact Name *
              </label>
              <input
                type="text"
                value={profileData.emergencyContact}
                onChange={(e) =>
                  setProfileData((prev) => ({
                    ...prev,
                    emergencyContact: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Emergency contact name"
                required
              />
            </div>

            {/* Emergency Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Emergency Contact Phone *
              </label>
              <input
                type="tel"
                value={profileData.emergencyPhone}
                onChange={(e) =>
                  setProfileData((prev) => ({
                    ...prev,
                    emergencyPhone: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Emergency contact phone"
                required
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address *
            </label>
            <textarea
              value={profileData.address}
              onChange={(e) =>
                setProfileData((prev) => ({ ...prev, address: e.target.value }))
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your full address"
              required
            />
          </div>

          {/* Medical Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medical Information *
            </label>
            <textarea
              value={profileData.medicalInfo}
              onChange={(e) =>
                setProfileData((prev) => ({
                  ...prev,
                  medicalInfo: e.target.value,
                }))
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Please provide relevant medical information, allergies, medications, etc."
              required
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              loading={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Saving Profile..." : "Save Profile"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  // Placeholder sections
  const DocumentsSection = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Documents</h2>
      {profileCompletion.isComplete ? (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-green-800 font-medium">
              Service Agreement Available
            </h3>
            <p className="text-green-700 text-sm mt-1">
              Your profile is complete! You can now download your service
              agreement.
            </p>
            <Button className="mt-3 bg-green-600 hover:bg-green-700 text-white">
              Download Service Agreement
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <FileText className="w-8 h-8 text-blue-600 mb-2" />
              <h4 className="font-medium">NDIS Plan</h4>
              <p className="text-sm text-gray-600">
                Your current NDIS plan document
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <FileText className="w-8 h-8 text-blue-600 mb-2" />
              <h4 className="font-medium">Service Agreement</h4>
              <p className="text-sm text-gray-600">
                Agreement with Casa Community
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Complete Your Profile First
          </h3>
          <p className="text-gray-600 mb-4">
            You need to complete your profile before accessing documents.
          </p>
          <Button
            onClick={() => handleNavigationClick("profile")}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Complete Profile
          </Button>
        </div>
      )}
    </div>
  );

  const ScheduleSection = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Schedule</h2>
      <div className="text-center py-8">
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Appointments Scheduled
        </h3>
        <p className="text-gray-600">
          Your upcoming appointments will appear here.
        </p>
      </div>
    </div>
  );

  const ChatSection = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Chat</h2>
      <div className="text-center py-8">
        <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Messages</h3>
        <p className="text-gray-600">
          Start a conversation with your support team.
        </p>
      </div>
    </div>
  );

  // Render active section
  const renderActiveSection = () => {
    switch (activeSection) {
      case "home":
        return <HomeSection />;
      case "documents":
        return <DocumentsSection />;
      case "schedule":
        return <ScheduleSection />;
      case "chat":
        return <ChatSection />;
      case "profile":
        return <ProfileSection />;
      default:
        return <HomeSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 mr-2"
                aria-label="Open sidebar"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                Casa Community Pty Ltd
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                Welcome, {user?.first_name}
              </span>
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.first_name?.[0]}
                  {user?.last_name?.[0]}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6">{renderActiveSection()}</main>
      </div>
    </div>
  );
};

export default ClientDashboard;
