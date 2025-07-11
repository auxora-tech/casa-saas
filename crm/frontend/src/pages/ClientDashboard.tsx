// src/pages/ClientDashboard.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Phone,
    Shield,
    Heart,
    Activity
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

// Types for better type safety
interface NavigationItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    isActive: boolean;
}

interface ParticipantProfile {
    // Basic Info (MANDATORY)
    preferred_name: string;
    date_of_birth: string;
    address: string;
    phone: string;
    photo: string | null;

    // Personal Details (OPTIONAL)
    gender: string;
    height: string;
    weight: string;
    hair_colour: string;
    eye_colour: string;
    spoken_language: string;
    distinguishing_features: string;
    clothing_size: string;
    shoe_size: string;
    religion_or_culture: string;

    // NDIS Info (MANDATORY)
    ndis_number: string;
    ndis_plan_start: string;
    ndis_plan_end: string;
    ndis_plan_managed_details: string;

    // Emergency Contacts (MANDATORY)
    emergency_contact_1: string;
    emergency_contact_2: string;

    // Medical Requirements (MANDATORY)
    name_of_doctor: string;
    medical_food_other_allergies: string;
    medical_condition: string;
    dietary_requirements: string;

    // About Me (OPTIONAL)
    likes: string;
    dislikes: string;
    hobbies_interests: string;
    supports_required: string;
    level_assistance_required: string;

    // Cards & Insurance (OPTIONAL)
    pension_type: string;
    pension_number: string;
    pension_expiry: string;
    private_insurance_type: string;
    private_insurance_number: string;
    private_insurance_expiry: string;
    medicare_number: string;
    medicare_expiry: string;
    healthcare_card_number: string;
    healthcare_card_expiry: string;
    companion_card_number: string;
    companion_card_expiry: string;

    // Support Needs (OPTIONAL)
    mobility: boolean;
    mobility_details: string;
    communication: boolean;
    communication_details: string;
    eating: boolean;
    eating_details: string;
    medication: boolean;
    medication_details: string;

    // Profile Status
    is_profile_completed: boolean;
}

interface ProfileCompletion {
    overall_percentage: number;
    mandatory_percentage: number;
    optional_percentage: number;
    mandatory_completed: number;
    mandatory_total: number;
    optional_completed: number;
    optional_total: number;
    missing_mandatory: string[];
    next_steps: string[];
}

const ClientDashboard: React.FC = () => {
    // State management
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeSection, setActiveSection] = useState<string>('home');
    const [participantProfile, setParticipantProfile] = useState<ParticipantProfile>({
        // Basic Info
        preferred_name: '',
        date_of_birth: '',
        address: '',
        phone: '',
        photo: null,

        // Personal Details
        gender: '',
        height: '',
        weight: '',
        hair_colour: '',
        eye_colour: '',
        spoken_language: '',
        distinguishing_features: '',
        clothing_size: '',
        shoe_size: '',
        religion_or_culture: '',

        // NDIS Info
        ndis_number: '',
        ndis_plan_start: '',
        ndis_plan_end: '',
        ndis_plan_managed_details: '',

        // Emergency Contacts
        emergency_contact_1: '',
        emergency_contact_2: '',

        // Medical Requirements
        name_of_doctor: '',
        medical_food_other_allergies: '',
        medical_condition: '',
        dietary_requirements: '',

        // About Me
        likes: '',
        dislikes: '',
        hobbies_interests: '',
        supports_required: '',
        level_assistance_required: '',

        // Cards & Insurance
        pension_type: '',
        pension_number: '',
        pension_expiry: '',
        private_insurance_type: '',
        private_insurance_number: '',
        private_insurance_expiry: '',
        medicare_number: '',
        medicare_expiry: '',
        healthcare_card_number: '',
        healthcare_card_expiry: '',
        companion_card_number: '',
        companion_card_expiry: '',

        // Support Needs
        mobility: false,
        mobility_details: '',
        communication: false,
        communication_details: '',
        eating: false,
        eating_details: '',
        medication: false,
        medication_details: '',

        // Profile Status
        is_profile_completed: false
    });

    const [profileCompletion, setProfileCompletion] = useState<ProfileCompletion>({
        overall_percentage: 0,
        mandatory_percentage: 0,
        optional_percentage: 0,
        mandatory_completed: 0,
        mandatory_total: 0,
        optional_completed: 0,
        optional_total: 0,
        missing_mandatory: [],
        next_steps: []
    });

    const [loading, setLoading] = useState(false);
    const [activeProfileStep, setActiveProfileStep] = useState<string>('basic');

    // Hooks
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Navigation items
    const navigationItems: NavigationItem[] = [
        { id: 'home', label: 'Home', icon: Home, isActive: activeSection === 'home' },
        { id: 'documents', label: 'Documents', icon: FileText, isActive: activeSection === 'documents' },
        { id: 'schedule', label: 'Schedule', icon: Calendar, isActive: activeSection === 'schedule' },
        { id: 'chat', label: 'Chat', icon: MessageCircle, isActive: activeSection === 'chat' },
        { id: 'profile', label: 'Profile', icon: User, isActive: activeSection === 'profile' }
    ];

    // Define mandatory and optional fields
    const mandatoryFields = [
        'preferred_name', 'date_of_birth', 'address', 'phone',
        'ndis_number', 'ndis_plan_start', 'ndis_plan_end', 'ndis_plan_managed_details',
        'emergency_contact_1', 'emergency_contact_2',
        'name_of_doctor', 'medical_food_other_allergies', 'medical_condition', 'dietary_requirements'
    ];

    const optionalFields = [
        'gender', 'height', 'weight', 'hair_colour', 'eye_colour', 'spoken_language',
        'distinguishing_features', 'clothing_size', 'shoe_size', 'religion_or_culture',
        'likes', 'dislikes', 'hobbies_interests', 'supports_required', 'level_assistance_required',
        'pension_type', 'pension_number', 'medicare_number', 'healthcare_card_number',
        'mobility_details', 'communication_details', 'eating_details', 'medication_details'
    ];

    // Calculate profile completion percentage
    const calculateProfileCompletion = useCallback(() => {
        // Calculate mandatory field completion
        const completedMandatory = mandatoryFields.filter(field => {
            const value = participantProfile[field as keyof ParticipantProfile];
            return value && value.toString().trim() !== '';
        });

        // Calculate optional field completion
        const completedOptional = optionalFields.filter(field => {
            const value = participantProfile[field as keyof ParticipantProfile];
            return value && value.toString().trim() !== '';
        });

        const mandatoryPercentage = Math.round((completedMandatory.length / mandatoryFields.length) * 100);
        const optionalPercentage = Math.round((completedOptional.length / optionalFields.length) * 100);

        // Overall percentage: Mandatory fields weight 70%, Optional fields weight 30%
        const overallPercentage = Math.round((mandatoryPercentage * 0.7) + (optionalPercentage * 0.3));

        const missingMandatory = mandatoryFields.filter(field => {
            const value = participantProfile[field as keyof ParticipantProfile];
            return !value || value.toString().trim() === '';
        });

        // Generate next steps
        let nextSteps: string[] = [];
        if (missingMandatory.length > 0) {
            nextSteps.push('Complete mandatory fields to access all services');
        }
        if (mandatoryPercentage === 100 && optionalPercentage < 50) {
            nextSteps.push('Add optional information to get personalized support');
        }
        if (overallPercentage >= 80) {
            nextSteps.push('Profile is almost complete! Review and finalize');
        }

        setProfileCompletion({
            overall_percentage: overallPercentage,
            mandatory_percentage: mandatoryPercentage,
            optional_percentage: optionalPercentage,
            mandatory_completed: completedMandatory.length,
            mandatory_total: mandatoryFields.length,
            optional_completed: completedOptional.length,
            optional_total: optionalFields.length,
            missing_mandatory: missingMandatory.map(field =>
                field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            ),
            next_steps: nextSteps
        });
    }, [participantProfile]);

    // Load participant profile data
    const loadParticipantProfile = useCallback(async () => {
        if (!user) return;

        setLoading(true);
        try {
            // In real implementation, fetch from Django API
            // const response = await api.get('/client/participant-profile/');
            // setParticipantProfile(response.data);

            // Mock data for demo
            const savedProfile = localStorage.getItem(`participant_${user.id}`);
            if (savedProfile) {
                setParticipantProfile(JSON.parse(savedProfile));
            }
        } catch (error) {
            console.error('Failed to load participant profile:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Calculate profile completion on mount and when profile data changes
    useEffect(() => {
        calculateProfileCompletion();
    }, [participantProfile]);

    // Load participant profile data
    useEffect(() => {
        loadParticipantProfile();
    }, [loadParticipantProfile]);

    // Handle navigation item click
    const handleNavigationClick = useCallback((sectionId: string) => {
        setActiveSection(sectionId);
        setSidebarOpen(false);
    }, []);

    // Handle logout
    const handleLogout = useCallback(async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }, [logout, navigate]);

    // Handle profile picture upload
    const handleProfilePictureUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setParticipantProfile(prev => ({
                    ...prev,
                    photo: result
                }));
                // Save to localStorage for demo
                const updatedProfile = { ...participantProfile, photo: result };
                localStorage.setItem(`participant_${user?.id}`, JSON.stringify(updatedProfile));
            };
            reader.readAsDataURL(file);
        }
    }, [participantProfile, user]);

    // Handle profile form submission
    const handleProfileSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // In real implementation, save to Django API
            // await api.put('/client/participant-profile/', participantProfile);

            // Save to localStorage for demo
            localStorage.setItem(`participant_${user?.id}`, JSON.stringify(participantProfile));

            // Update completion status if mandatory fields are complete
            if (profileCompletion.mandatory_percentage === 100) {
                setParticipantProfile(prev => ({
                    ...prev,
                    is_profile_completed: true
                }));
            }

            alert('Profile updated successfully!');

        } catch (error) {
            console.error('Failed to update profile:', error);
            alert('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [participantProfile, user, profileCompletion.mandatory_percentage]);

    // Handle profile field change
    const handleProfileChange = useCallback((field: string, value: string | boolean) => {
        setParticipantProfile(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    // Get completion color based on percentage
    const getCompletionColor = (percentage: number) => {
        if (percentage < 30) return 'bg-red-500';
        if (percentage < 70) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    // Sidebar component
    const Sidebar = () => (
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Navigation</h2>
                <button
                    title='side-navigation'
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-2">
                {navigationItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => handleNavigationClick(item.id)}
                            className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200 ${item.isActive
                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                        >
                            <IconComponent className="w-5 h-5 mr-3" />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="border-t border-gray-200 p-4">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 text-left rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200 cursor-pointer"
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
                <div className="flex items-center space-x-4 mb-6">
                    {/* Profile Picture */}
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {participantProfile.photo ? (
                                <img
                                    src={participantProfile.photo}
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
                                title='profile-pic'
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
                            {participantProfile.preferred_name || `${user?.first_name} ${user?.last_name}`}
                        </h3>
                        <p className="text-gray-600">{user?.work_email}</p>
                        {participantProfile.ndis_number && (
                            <p className="text-sm text-blue-600">NDIS: {participantProfile.ndis_number}</p>
                        )}
                    </div>
                </div>

                {/* Profile Completion Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Overall Completion */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Overall</span>
                            <span className="text-lg font-bold text-gray-900">{profileCompletion.overall_percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all duration-300 ${getCompletionColor(profileCompletion.overall_percentage)}`}
                                style={{ width: `${profileCompletion.overall_percentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Mandatory Fields */}
                    <div className="bg-red-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-red-700">Mandatory</span>
                            <span className="text-lg font-bold text-red-900">
                                {profileCompletion.mandatory_completed}/{profileCompletion.mandatory_total}
                            </span>
                        </div>
                        <div className="w-full bg-red-200 rounded-full h-2">
                            <div
                                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${profileCompletion.mandatory_percentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Optional Fields */}
                    <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-blue-700">Optional</span>
                            <span className="text-lg font-bold text-blue-900">
                                {profileCompletion.optional_completed}/{profileCompletion.optional_total}
                            </span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${profileCompletion.optional_percentage}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Profile Completion Status */}
                {profileCompletion.mandatory_percentage === 100 ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                            <div>
                                <h4 className="text-green-800 font-medium">Mandatory Profile Complete! 🎉</h4>
                                <p className="text-green-700 text-sm mt-1">
                                    All required information is complete. You can now access your service agreement and all NDIS services.
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <button
                                        onClick={() => handleNavigationClick('documents')}
                                        className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-md flex items-center transition-colors"
                                    >
                                        Get Service Agreement <ArrowRight className="w-4 h-4 ml-1" />
                                    </button>
                                    {profileCompletion.optional_percentage < 100 && (
                                        <button
                                            onClick={() => handleNavigationClick('profile')}
                                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm px-4 py-2 rounded-md transition-colors"
                                        >
                                            Complete Optional Fields ({profileCompletion.optional_percentage}%)
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start">
                            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                            <div>
                                <h4 className="text-yellow-800 font-medium">Complete Mandatory Fields</h4>
                                <p className="text-yellow-700 text-sm mt-1">
                                    Complete all mandatory fields to access NDIS services and get your service agreement.
                                </p>
                                <div className="mt-2">
                                    <p className="text-yellow-600 text-xs">
                                        Missing: {profileCompletion.missing_mandatory.slice(0, 3).join(', ')}
                                        {profileCompletion.missing_mandatory.length > 3 && ` and ${profileCompletion.missing_mandatory.length - 3} more`}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleNavigationClick('profile')}
                                    className="mt-3 bg-yellow-600 hover:bg-yellow-700 text-white text-sm px-4 py-2 rounded-md flex items-center transition-colors"
                                >
                                    Complete Profile ({profileCompletion.mandatory_percentage}% done) <ArrowRight className="w-4 h-4 ml-1" />
                                </button>
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
                                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    // Profile section with multi-step form
    const ProfileSection = () => {
        const profileSteps = [
            { id: 'basic', label: 'Basic Info', icon: User },
            { id: 'ndis', label: 'NDIS Details', icon: Shield },
            { id: 'emergency', label: 'Emergency', icon: Phone },
            { id: 'medical', label: 'Medical', icon: Heart },
            { id: 'personal', label: 'Personal', icon: Activity }
        ];

        const renderBasicInfo = () => (
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Name *</label>
                        <input
                            type="text"
                            value={participantProfile.preferred_name}
                            onChange={(e) => handleProfileChange('preferred_name', e.target.value)}
                            placeholder="What would you like us to call you?"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                        <input
                            title='date_of_birth'
                            type="date"
                            value={participantProfile.date_of_birth}
                            onChange={(e) => handleProfileChange('date_of_birth', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                        <input
                            type="tel"
                            value={participantProfile.phone}
                            onChange={(e) => handleProfileChange('phone', e.target.value)}
                            placeholder="+61 4XX XXX XXX"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender (Optional)</label>
                        <select
                            title='gender'
                            value={participantProfile.gender}
                            onChange={(e) => handleProfileChange('gender', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="non_binary">Non-binary</option>
                            <option value="prefer_not_to_say">Prefer not to say</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                    <textarea
                        value={participantProfile.address}
                        onChange={(e) => handleProfileChange('address', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Full residential address"
                        required
                    />
                </div>
            </div>
        );

        const renderNDISInfo = () => (
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">NDIS Number *</label>
                        <input
                            type="text"
                            value={participantProfile.ndis_number}
                            onChange={(e) => handleProfileChange('ndis_number', e.target.value)}
                            placeholder="Your NDIS participant number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">NDIS Plan Start Date *</label>
                        <input
                            type="date"
                            title='NDIS plan start date'
                            value={participantProfile.ndis_plan_start}
                            onChange={(e) => handleProfileChange('ndis_plan_start', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">NDIS Plan End Date *</label>
                        <input
                            type="date"
                            title='NDIS plan end date'
                            value={participantProfile.ndis_plan_end}
                            onChange={(e) => handleProfileChange('ndis_plan_end', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Plan Management Details *</label>
                    <textarea
                        value={participantProfile.ndis_plan_managed_details}
                        onChange={(e) => handleProfileChange('ndis_plan_managed_details', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Details about how your NDIS plan is managed"
                        required
                    />
                </div>
            </div>
        );

        const renderEmergencyContacts = () => (
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact 1 *</label>
                        <input
                            type="tel"
                            value={participantProfile.emergency_contact_1}
                            onChange={(e) => handleProfileChange('emergency_contact_1', e.target.value)}
                            placeholder="Primary emergency contact"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact 2 *</label>
                        <input
                            type="tel"
                            value={participantProfile.emergency_contact_2}
                            onChange={(e) => handleProfileChange('emergency_contact_2', e.target.value)}
                            placeholder="Secondary emergency contact"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                </div>
            </div>
        );

        const renderMedicalInfo = () => (
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Doctor's Name *</label>
                    <input
                        type="text"
                        value={participantProfile.name_of_doctor}
                        onChange={(e) => handleProfileChange('name_of_doctor', e.target.value)}
                        placeholder="Your primary doctor's name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Medical Condition *</label>
                    <textarea
                        value={participantProfile.medical_condition}
                        onChange={(e) => handleProfileChange('medical_condition', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe your medical condition(s)"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Allergies *</label>
                    <textarea
                        value={participantProfile.medical_food_other_allergies}
                        onChange={(e) => handleProfileChange('medical_food_other_allergies', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="List any medical, food, or other allergies"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Requirements *</label>
                    <textarea
                        value={participantProfile.dietary_requirements}
                        onChange={(e) => handleProfileChange('dietary_requirements', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe any dietary requirements or restrictions"
                        required
                    />
                </div>
            </div>
        );

        const renderPersonalDetails = () => (
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Spoken Language</label>
                        <input
                            type="text"
                            value={participantProfile.spoken_language}
                            onChange={(e) => handleProfileChange('spoken_language', e.target.value)}
                            placeholder="Primary language spoken"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Religion or Culture</label>
                        <input
                            type="text"
                            value={participantProfile.religion_or_culture}
                            onChange={(e) => handleProfileChange('religion_or_culture', e.target.value)}
                            placeholder="Religious or cultural background"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Likes & Interests</label>
                    <textarea
                        value={participantProfile.likes}
                        onChange={(e) => handleProfileChange('likes', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Things you enjoy doing"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dislikes</label>
                    <textarea
                        value={participantProfile.dislikes}
                        onChange={(e) => handleProfileChange('dislikes', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Things you prefer to avoid"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Support Required</label>
                    <textarea
                        value={participantProfile.supports_required}
                        onChange={(e) => handleProfileChange('supports_required', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe the types of support you need"
                    />
                </div>
            </div>
        );

        const renderActiveStep = () => {
            switch (activeProfileStep) {
                case 'basic':
                    return renderBasicInfo();
                case 'ndis':
                    return renderNDISInfo();
                case 'emergency':
                    return renderEmergencyContacts();
                case 'medical':
                    return renderMedicalInfo();
                case 'personal':
                    return renderPersonalDetails();
                default:
                    return renderBasicInfo();
            }
        };

        return (
            <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Complete Your Profile</h2>
                            <p className="text-gray-600 mt-1">
                                Overall completion: {profileCompletion.overall_percentage}%
                                (Mandatory: {profileCompletion.mandatory_percentage}%, Optional: {profileCompletion.optional_percentage}%)
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-2xl font-bold text-gray-600">{profileCompletion.overall_percentage}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {profileSteps.map((step) => {
                            const IconComponent = step.icon;
                            const isActive = activeProfileStep === step.id;
                            return (
                                <button
                                    key={step.id}
                                    onClick={() => setActiveProfileStep(step.id)}
                                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    <IconComponent className="w-4 h-4 mr-2" />
                                    {step.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Form Content */}
                    <form onSubmit={handleProfileSubmit}>
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                {profileSteps.find(step => step.id === activeProfileStep)?.label}
                            </h3>
                            {renderActiveStep()}
                        </div>

                        {/* Navigation and Save */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
                            <div className="flex gap-2">
                                {profileSteps.map((step, index) => {
                                    if (step.id === activeProfileStep && index > 0) {
                                        return (
                                            <button
                                                key="prev"
                                                type="button"
                                                onClick={() => setActiveProfileStep(profileSteps[index - 1].id)}
                                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
                                            >
                                                Previous
                                            </button>
                                        );
                                    }
                                    if (step.id === activeProfileStep && index < profileSteps.length - 1) {
                                        return (
                                            <button
                                                key="next"
                                                type="button"
                                                onClick={() => setActiveProfileStep(profileSteps[index + 1].id)}
                                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                                            >
                                                Next
                                            </button>
                                        );
                                    }
                                    return null;
                                })}
                            </div>

                            <div className="flex-1" />

                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md transition-colors"
                            >
                                {loading ? 'Saving...' : 'Save Progress'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Completion Guide */}
                <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">💡 Completion Guide</h3>
                    <div className="text-sm text-blue-800 space-y-1">
                        <p>• <strong>Mandatory fields (70% weight):</strong> Required to access NDIS services</p>
                        <p>• <strong>Optional fields (30% weight):</strong> Help us provide personalized support</p>
                        <p>• <strong>80%+ completion:</strong> Recommended for optimal service delivery</p>
                    </div>
                </div>
            </div>
        );
    };

    // Documents section
    const DocumentsSection = () => (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Documents</h2>
            {profileCompletion.mandatory_percentage === 100 ? (
                <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h3 className="text-green-800 font-medium">Service Agreement Available</h3>
                        <p className="text-green-700 text-sm mt-1">
                            All mandatory fields complete! Download your service agreement and other documents.
                        </p>
                        <button className="mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors">
                            Download Service Agreement
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer">
                            <FileText className="w-8 h-8 text-blue-600 mb-2" />
                            <h4 className="font-medium">NDIS Plan</h4>
                            <p className="text-sm text-gray-600">Your current NDIS plan document</p>
                            <button className="mt-2 text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded transition-colors">
                                Download
                            </button>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer">
                            <FileText className="w-8 h-8 text-green-600 mb-2" />
                            <h4 className="font-medium">Service Agreement</h4>
                            <p className="text-sm text-gray-600">Agreement with Casa Community</p>
                            <button className="mt-2 text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded transition-colors">
                                Download
                            </button>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer">
                            <FileText className="w-8 h-8 text-purple-600 mb-2" />
                            <h4 className="font-medium">Support Plan</h4>
                            <p className="text-sm text-gray-600">Personalized support plan</p>
                            <button className="mt-2 text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded transition-colors">
                                Download
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Complete Mandatory Fields First</h3>
                    <p className="text-gray-600 mb-4">
                        You need to complete {profileCompletion.mandatory_total - profileCompletion.mandatory_completed} more mandatory field{profileCompletion.mandatory_total - profileCompletion.mandatory_completed !== 1 ? 's' : ''} to access documents.
                    </p>
                    <div className="mb-4">
                        <div className="w-32 mx-auto bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${profileCompletion.mandatory_percentage}%` }}
                            />
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{profileCompletion.mandatory_percentage}% complete</p>
                    </div>
                    <button
                        onClick={() => handleNavigationClick('profile')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                    >
                        Complete Profile
                    </button>
                </div>
            )}
        </div>
    );

    // Schedule section
    const ScheduleSection = () => (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Schedule</h2>
            <div className="text-center py-8">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointments Scheduled</h3>
                <p className="text-gray-600">Your upcoming appointments and support sessions will appear here.</p>
            </div>
        </div>
    );

    // Chat section
    const ChatSection = () => (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Chat</h2>
            <div className="text-center py-8">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Messages</h3>
                <p className="text-gray-600">Start a conversation with your support coordinator or team.</p>
            </div>
        </div>
    );

    // Render active section
    const renderActiveSection = () => {
        switch (activeSection) {
            case 'home':
                return <HomeSection />;
            case 'documents':
                return <DocumentsSection />;
            case 'schedule':
                return <ScheduleSection />;
            case 'chat':
                return <ChatSection />;
            case 'profile':
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
                            <div className="hidden sm:block text-right">
                                <p className="text-sm text-gray-600">Welcome, {user?.first_name}</p>
                                <p className="text-xs text-gray-500">{profileCompletion.overall_percentage}% complete</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="p-6">
                    {renderActiveSection()}
                </main>
            </div>
        </div>
    );
};

export default ClientDashboard;
