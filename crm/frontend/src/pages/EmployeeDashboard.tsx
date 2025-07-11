// src/pages/EmployeeDashboard.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Menu,
    X,
    Home,
    FileText,
    Calendar,
    User,
    LogOut,
    Camera,
    CheckCircle,
    AlertCircle,
    ArrowRight,
    UserPlus,
    Shield,
    Phone,
    Mail,
    Eye,
    EyeOff,
    Users,
    Clock,
    Heart
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';

// Types for better type safety
interface NavigationItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    isActive: boolean;
    adminOnly?: boolean;
}

interface EmployeeProfile {
    // Basic Info (MANDATORY)
    date_of_birth: string;
    address: string;
    phone: string;
    suburb: string;
    state_territory: string;
    postcode: string;
    tfn: string;

    // Superannuation Details (OPTIONAL)
    fund_name: string;
    abn: string;
    member_number: string;

    // Banking Details (MANDATORY)
    bank_name: string;
    account_name: string;
    bsb: string;
    account_number: string;

    // Emergency Contact Details (MANDATORY)
    emergency_contact_first_name: string;
    emergency_contact_last_name: string;
    emergency_contact_number: string;
    emergency_contact_home: string;
    emergency_contact_relationship: string;

    // Profile Status
    photo: string | null;
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
}

interface NewSupportWorker {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    position: string;
}

const EmployeeDashboard: React.FC = () => {
    // State management
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeSection, setActiveSection] = useState<string>('home');
    const [employeeProfile, setEmployeeProfile] = useState<EmployeeProfile>({
        // Basic Info
        date_of_birth: '',
        address: '',
        phone: '',
        suburb: '',
        state_territory: '',
        postcode: '',
        tfn: '',

        // Superannuation Details
        fund_name: '',
        abn: '',
        member_number: '',

        // Banking Details
        bank_name: '',
        account_name: '',
        bsb: '',
        account_number: '',

        // Emergency Contact Details
        emergency_contact_first_name: '',
        emergency_contact_last_name: '',
        emergency_contact_number: '',
        emergency_contact_home: '',
        emergency_contact_relationship: '',

        // Profile Status
        photo: null,
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
        missing_mandatory: []
    });

    const [newWorker, setNewWorker] = useState<NewSupportWorker>({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        position: 'support_worker'
    });

    const [loading, setLoading] = useState(false);
    const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [activeProfileStep, setActiveProfileStep] = useState<string>('basic');

    // Hooks
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Check if user is admin
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'admin';
    const isSupportWorker = user?.role === 'SUPPORT_WORKER' || user?.role === 'support_worker';

    // Navigation items with role-based access
    const navigationItems: NavigationItem[] = [
        { id: 'home', label: 'Home', icon: Home, isActive: activeSection === 'home' },
        { id: 'documents', label: 'Documents', icon: FileText, isActive: activeSection === 'documents' },
        { id: 'schedule', label: 'Schedule', icon: Calendar, isActive: activeSection === 'schedule', adminOnly: false },
        { id: 'add-worker', label: 'Add Support Worker', icon: UserPlus, isActive: activeSection === 'add-worker', adminOnly: true },
        { id: 'profile', label: 'Profile', icon: User, isActive: activeSection === 'profile' }
    ].filter(item => !item.adminOnly || isAdmin);

    // Define mandatory and optional fields (moved outside component to prevent recreation)
    const mandatoryFields = React.useMemo(() => [
        'date_of_birth', 'address', 'phone', 'tfn',
        'bank_name', 'account_name', 'bsb', 'account_number',
        'emergency_contact_first_name', 'emergency_contact_number', 'emergency_contact_relationship'
    ], []);

    const optionalFields = React.useMemo(() => [
        'suburb', 'state_territory', 'postcode',
        'fund_name', 'abn', 'member_number',
        'emergency_contact_last_name', 'emergency_contact_home'
    ], []);

    // Calculate profile completion percentage
    const calculateProfileCompletion = useCallback(() => {
        const completedMandatory = mandatoryFields.filter(field => {
            const value = employeeProfile[field as keyof EmployeeProfile];
            return value && value.toString().trim() !== '';
        });

        const completedOptional = optionalFields.filter(field => {
            const value = employeeProfile[field as keyof EmployeeProfile];
            return value && value.toString().trim() !== '';
        });

        const mandatoryPercentage = Math.round((completedMandatory.length / mandatoryFields.length) * 100);
        const optionalPercentage = Math.round((completedOptional.length / optionalFields.length) * 100);
        const overallPercentage = Math.round((mandatoryPercentage * 0.8) + (optionalPercentage * 0.2));

        const missingMandatory = mandatoryFields.filter(field => {
            const value = employeeProfile[field as keyof EmployeeProfile];
            return !value || value.toString().trim() === '';
        });

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
            )
        });
    }, [employeeProfile]);

    // Load employee profile data
    const loadEmployeeProfile = useCallback(async () => {
        if (!user) return;

        setLoading(true);
        try {
            const profileData = await authService.getEmployeeProfile();

            // Map API response to frontend state
            setEmployeeProfile({
                date_of_birth: profileData.date_of_birth || '',
                address: profileData.address || '',
                phone: profileData.phone || '',
                suburb: profileData.suburb || '',
                state_territory: profileData.state_territory || '',
                postcode: profileData.postcode || '',
                tfn: profileData.tfn || '',
                fund_name: profileData.fund_name || '',
                abn: profileData.abn || '',
                member_number: profileData.member_number ? profileData.member_number.toString() : '',
                bank_name: profileData.bank_name || '',
                account_name: profileData.account_name || '',
                bsb: profileData.bsb || '',
                account_number: profileData.account_number || '',
                emergency_contact_first_name: profileData.emergency_contact_first_name || '',
                emergency_contact_last_name: profileData.emergency_contact_last_name || '',
                emergency_contact_number: profileData.emergency_contact_number || '',
                emergency_contact_home: profileData.emergency_contact_home || '',
                emergency_contact_relationship: profileData.emergency_contact_relationship || '',
                photo: null, // Handle separately if needed
                is_profile_completed: false // Calculate based on completion
            });
        } catch (error) {
            console.error('Failed to load employee profile:', error);
            // Fallback to localStorage for demo
            const savedProfile = localStorage.getItem(`employee_${user.id}`);
            if (savedProfile) {
                setEmployeeProfile(JSON.parse(savedProfile));
            }
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Calculate profile completion on mount and when profile data changes
    useEffect(() => {
        calculateProfileCompletion();
    }, [employeeProfile]);

    // Load employee profile data
    useEffect(() => {
        loadEmployeeProfile();
    }, [loadEmployeeProfile]);

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
    const handleProfilePictureUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setLoading(true);
            const result = await authService.updateEmployeeProfilePicture(file);

            setEmployeeProfile(prev => ({
                ...prev,
                photo: result.photo_url
            }));

            alert('Profile picture updated successfully!');

            // Also save to localStorage for demo
            const updatedProfile = { ...employeeProfile, photo: result.photo_url };
            localStorage.setItem(`participant_${user?.id}`, JSON.stringify(updatedProfile));

        } catch (error) {
            console.error('Failed to upload profile picture:', error);
            alert('Failed to upload profile picture. Please try again.');

            // Fallback to local file reading for demo
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setEmployeeProfile(prev => ({
                    ...prev,
                    photo: result
                }));
                // Save to localStorage for demo
                const updatedProfile = { ...employeeProfile, photo: result };
                localStorage.setItem(`employee_${user?.id}`, JSON.stringify(updatedProfile));
            };
            reader.readAsDataURL(file);
        } finally {
            setLoading(false);
        }
    }, [employeeProfile, user]);

    // Handle profile form submission
    const handleProfileSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Prepare data for Django backend using authService interface
            const profileData = {
                // User info (from auth context)
                first_name: user?.first_name,
                last_name: user?.last_name,
                email: user?.work_email,

                // Basic Info (REQUIRED)
                date_of_birth: employeeProfile.date_of_birth,
                address: employeeProfile.address,
                phone: employeeProfile.phone,
                tfn: employeeProfile.tfn,

                // Location (OPTIONAL)
                suburb: employeeProfile.suburb || undefined,
                state_territory: employeeProfile.state_territory || undefined,
                postcode: employeeProfile.postcode || undefined,

                // Superannuation (OPTIONAL)
                fund_name: employeeProfile.fund_name || undefined,
                abn: employeeProfile.abn || undefined,
                member_number: employeeProfile.member_number ? parseInt(employeeProfile.member_number) : null,

                // Bank Details (REQUIRED)
                bank_name: employeeProfile.bank_name,
                account_name: employeeProfile.account_name,
                bsb: employeeProfile.bsb,
                account_number: employeeProfile.account_number,

                // Emergency Contact (REQUIRED)
                emergency_contact_first_name: employeeProfile.emergency_contact_first_name,
                emergency_contact_last_name: employeeProfile.emergency_contact_last_name || undefined,
                emergency_contact_number: employeeProfile.emergency_contact_number,
                emergency_contact_home: employeeProfile.emergency_contact_home || undefined,
                emergency_contact_relationship: employeeProfile.emergency_contact_relationship
            };

            // Call the auth service
            const result = await authService.createOrUpdateEmployeeProfile(profileData);

            alert(result.message);

            // Update completion status if successful
            if (profileCompletion.mandatory_percentage === 100) {
                setEmployeeProfile(prev => ({
                    ...prev,
                    is_profile_completed: true
                }));
            }

            // Save to localStorage for demo persistence
            localStorage.setItem(`employee_${user?.id}`, JSON.stringify(employeeProfile));

        } catch (error: any) {
            console.error('Failed to update profile:', error);

            // Handle specific error types from authService
            if (error.missing_fields) {
                alert(`Missing required fields: ${error.missing_fields.join(', ')}`);
            } else {
                alert(error.message || 'Failed to update profile. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }, [employeeProfile, user, profileCompletion.mandatory_percentage]);

    // Handle profile field change
    const handleProfileChange = useCallback((field: keyof EmployeeProfile, value: string | boolean) => {
        setEmployeeProfile(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    // Handle new worker field change
    const handleNewWorkerChange = useCallback((field: string, value: string) => {
        setNewWorker(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    // Handle add support worker
    const handleAddSupportWorker = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Prepare data for Django backend using authService
            const employeeData = {
                work_email: newWorker.email,
                password: newWorker.password,
                first_name: newWorker.first_name,
                last_name: newWorker.last_name,
                role: newWorker.position
            };

            // Use authService addEmployee function
            const result = await authService.addEmployee(employeeData);

            alert(result.message || `Support worker ${newWorker.first_name} ${newWorker.last_name} added successfully!`);

            // Reset form
            setNewWorker({
                first_name: '',
                last_name: '',
                email: '',
                password: '',
                position: 'support_worker'
            });

        } catch (error: any) {
            console.error('Failed to add support worker:', error);

            // Handle specific error types
            if (error.response?.data?.error) {
                alert(`Error: ${error.response.data.error}`);
            } else {
                alert('Failed to add support worker. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }, [newWorker]);

    // Generate random password
    const generatePassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setNewWorker(prev => ({ ...prev, password }));
    };

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
                <h2 className="text-lg font-semibold text-gray-800">
                    {isAdmin ? 'Admin Panel' : 'Employee Portal'}
                </h2>
                <button
                    title='position'
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
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">
                    Welcome back, {user?.first_name}! 👋
                </h2>
                <p className="text-purple-100">
                    {isAdmin ? 'Manage your team and oversee NDIS operations.' : 'Manage your profile and support your clients.'}
                </p>
                <div className="mt-3 text-sm text-purple-200">
                    Role: {isAdmin ? 'Administrator' : 'Support Worker'}
                </div>
            </div>

            {/* Profile Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-4 mb-6">
                    {/* Profile Picture */}
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {employeeProfile.photo ? (
                                <img
                                    src={employeeProfile.photo}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User className="w-8 h-8 text-gray-400" />
                            )}
                        </div>
                        <label className="absolute bottom-0 right-0 bg-purple-600 rounded-full p-1 cursor-pointer hover:bg-purple-700 transition-colors">
                            <Camera className="w-3 h-3 text-white" />
                            <input
                                title='picture'
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
                        <p className="text-gray-600">{user?.work_email}</p>
                        {employeeProfile.phone && (
                            <p className="text-sm text-purple-600">Phone: {employeeProfile.phone}</p>
                        )}
                        {employeeProfile.tfn && (
                            <p className="text-sm text-gray-600">TFN: ***{employeeProfile.tfn.slice(-3)}</p>
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
                    <div className="bg-purple-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-purple-700">Optional</span>
                            <span className="text-lg font-bold text-purple-900">
                                {profileCompletion.optional_completed}/{profileCompletion.optional_total}
                            </span>
                        </div>
                        <div className="w-full bg-purple-200 rounded-full h-2">
                            <div
                                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
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
                                <h4 className="text-green-800 font-medium">Profile Complete! 🎉</h4>
                                <p className="text-green-700 text-sm mt-1">
                                    All required information is complete. You can now access employment documents.
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <button
                                        onClick={() => handleNavigationClick('documents')}
                                        className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-md flex items-center transition-colors"
                                    >
                                        View Documents <ArrowRight className="w-4 h-4 ml-1" />
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
                                <h4 className="text-yellow-800 font-medium">Complete Your Profile</h4>
                                <p className="text-yellow-700 text-sm mt-1">
                                    Complete all mandatory fields to access employment documents and full system features.
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
                                className="p-4 text-center border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
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
            { id: 'superannuation', label: 'Superannuation', icon: Shield },
            { id: 'banking', label: 'Banking', icon: Phone },
            { id: 'emergency', label: 'Emergency Contact', icon: Heart }
        ];

        const renderBasicInfo = () => (
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                        <input
                            title='dob'
                            type="date"
                            value={employeeProfile.date_of_birth}
                            onChange={(e) => handleProfileChange('date_of_birth', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                        <input
                            type="tel"
                            value={employeeProfile.phone}
                            onChange={(e) => handleProfileChange('phone' as keyof EmployeeProfile, e.target.value)}
                            placeholder="+61 4XX XXX XXX"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Suburb</label>
                        <input
                            type="text"
                            value={employeeProfile.suburb}
                            onChange={(e) => handleProfileChange('suburb', e.target.value)}
                            placeholder="Suburb"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State/Territory</label>
                        <select
                            title='state'
                            value={employeeProfile.state_territory}
                            onChange={(e) => handleProfileChange('state_territory', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                            <option value="">Select State/Territory</option>
                            <option value="NSW">New South Wales</option>
                            <option value="VIC">Victoria</option>
                            <option value="QLD">Queensland</option>
                            <option value="WA">Western Australia</option>
                            <option value="SA">South Australia</option>
                            <option value="TAS">Tasmania</option>
                            <option value="ACT">Australian Capital Territory</option>
                            <option value="NT">Northern Territory</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Postcode</label>
                        <input
                            type="text"
                            value={employeeProfile.postcode}
                            onChange={(e) => handleProfileChange('postcode', e.target.value)}
                            placeholder="Postcode"
                            maxLength={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tax File Number (TFN) *</label>
                        <input
                            type="text"
                            value={employeeProfile.tfn}
                            onChange={(e) => {
                                // Only allow digits and limit to 9 characters
                                const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                                handleProfileChange('tfn', value);
                            }}
                            placeholder="123456789"
                            maxLength={9}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">9 digits only, no spaces or dashes</p>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                    <textarea
                        value={employeeProfile.address}
                        onChange={(e) => handleProfileChange('address', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Full residential address"
                        required
                    />
                </div>
            </div>
        );

        const renderSuperannuation = () => (
            <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-blue-800 text-sm">
                        <Shield className="w-4 h-4 inline mr-1" />
                        Superannuation details are optional but recommended for payroll setup.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fund Name</label>
                        <input
                            type="text"
                            value={employeeProfile.fund_name}
                            onChange={(e) => handleProfileChange('fund_name', e.target.value)}
                            placeholder="Superannuation fund name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ABN</label>
                        <input
                            type="text"
                            value={employeeProfile.abn}
                            onChange={(e) => {
                                // Only allow digits and limit to 12 characters
                                const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                                handleProfileChange('abn', value);
                            }}
                            placeholder="123456789012"
                            maxLength={12}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">12 digits only</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Member Number</label>
                        <input
                            type="text"
                            value={employeeProfile.member_number}
                            onChange={(e) => {
                                // Only allow digits
                                const value = e.target.value.replace(/\D/g, '');
                                handleProfileChange('member_number', value);
                            }}
                            placeholder="Member number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Numbers only</p>
                    </div>
                </div>
            </div>
        );

        const renderBankingInfo = () => (
            <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-blue-800 text-sm">
                        <Shield className="w-4 h-4 inline mr-1" />
                        Your banking information is encrypted and securely stored for payroll purposes.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name *</label>
                        <input
                            type="text"
                            value={employeeProfile.bank_name}
                            onChange={(e) => handleProfileChange('bank_name', e.target.value)}
                            placeholder="Bank name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Account Name *</label>
                        <input
                            type="text"
                            value={employeeProfile.account_name}
                            onChange={(e) => handleProfileChange('account_name', e.target.value)}
                            placeholder="Account holder name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">BSB *</label>
                        <input
                            type="text"
                            value={employeeProfile.bsb}
                            onChange={(e) => {
                                // Only allow digits and limit to 6 characters
                                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                handleProfileChange('bsb', value);
                            }}
                            placeholder="123456"
                            maxLength={6}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">6 digits only, no dashes</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Account Number *</label>
                        <input
                            type="text"
                            value={employeeProfile.account_number}
                            onChange={(e) => {
                                // Only allow digits and limit to 10 characters
                                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                handleProfileChange('account_number', value);
                            }}
                            placeholder="1234567890"
                            maxLength={10}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">Digits only, maximum 10 digits</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tax File Number *</label>
                        <input
                            type="text"
                            value={employeeProfile.tfn}
                            onChange={(e) => handleProfileChange('tax_file_number', e.target.value)}
                            placeholder="Tax file number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            required
                        />
                    </div>
                </div>
            </div>
        );

        const renderEmergencyContact = () => (
            <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-800 text-sm">
                        <Heart className="w-4 h-4 inline mr-1" />
                        Emergency contact information is mandatory for workplace safety compliance.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact First Name *</label>
                        <input
                            type="text"
                            value={employeeProfile.emergency_contact_first_name}
                            onChange={(e) => handleProfileChange('emergency_contact_first_name', e.target.value)}
                            placeholder="First name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Last Name</label>
                        <input
                            type="text"
                            value={employeeProfile.emergency_contact_last_name}
                            onChange={(e) => handleProfileChange('emergency_contact_last_name', e.target.value)}
                            placeholder="Last name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Phone *</label>
                        <input
                            type="tel"
                            value={employeeProfile.emergency_contact_number}
                            onChange={(e) => handleProfileChange('emergency_contact_number', e.target.value)}
                            placeholder="+61 4XX XXX XXX"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Home Phone</label>
                        <input
                            type="tel"
                            value={employeeProfile.emergency_contact_home}
                            onChange={(e) => handleProfileChange('emergency_contact_home', e.target.value)}
                            placeholder="+61 X XXXX XXXX"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Relationship *</label>
                        <select
                            title='relationship'
                            value={employeeProfile.emergency_contact_relationship}
                            onChange={(e) => handleProfileChange('emergency_contact_relationship', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            required
                        >
                            <option value="">Select relationship</option>
                            <option value="spouse">Spouse</option>
                            <option value="partner">Partner</option>
                            <option value="parent">Parent</option>
                            <option value="sibling">Sibling</option>
                            <option value="child">Child</option>
                            <option value="friend">Friend</option>
                            <option value="relative">Relative</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>
            </div>
        );

        const renderActiveStep = () => {
            switch (activeProfileStep) {
                case 'basic':
                    return renderBasicInfo();
                case 'superannuation':
                    return renderSuperannuation();
                case 'banking':
                    return renderBankingInfo();
                case 'emergency':
                    return renderEmergencyContact();
                default:
                    return renderBasicInfo();
            }
        };

        return (
            <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Complete Your Employee Profile</h2>
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
                                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
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
                                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
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
                                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-2 rounded-md transition-colors"
                            >
                                {loading ? 'Saving...' : 'Save Progress'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Completion Guide */}
                <div className="bg-purple-50 rounded-lg p-4">
                    <h3 className="font-semibold text-purple-900 mb-2">💼 Employee Profile Guide</h3>
                    <div className="text-sm text-purple-800 space-y-1">
                        <p>• <strong>Mandatory fields (80% weight):</strong> Required for employment documents and payroll</p>
                        <p>• <strong>Optional fields (20% weight):</strong> Help us provide better workplace support</p>
                        <p>• <strong>100% completion:</strong> Access to all employment documents and benefits</p>
                    </div>
                </div>
            </div>
        );
    };

    // Add Support Worker section (Admin only)
    const AddSupportWorkerSection = () => (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Add Support Worker</h2>
                        <p className="text-gray-600 mt-1">Create a new support worker account</p>
                    </div>
                    <Users className="w-8 h-8 text-purple-600" />
                </div>

                <form onSubmit={handleAddSupportWorker} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                            <input
                                type="text"
                                value={newWorker.first_name}
                                onChange={(e) => handleNewWorkerChange('first_name', e.target.value)}
                                placeholder="First name"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                            <input
                                type="text"
                                value={newWorker.last_name}
                                onChange={(e) => handleNewWorkerChange('last_name', e.target.value)}
                                placeholder="Last name"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                            <input
                                type="email"
                                value={newWorker.email}
                                onChange={(e) => handleNewWorkerChange('email', e.target.value)}
                                placeholder="work.email@example.com"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
                            <select
                                title='position'
                                value={newWorker.position}
                                onChange={(e) => handleNewWorkerChange('position', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                required
                            >
                                <option value="support_worker">Support Worker</option>
                                <option value="senior_support_worker">Senior Support Worker</option>
                                <option value="team_leader">Team Leader</option>
                                <option value="coordinator">Coordinator</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={newWorker.password}
                                    onChange={(e) => handleNewWorkerChange('password', e.target.value)}
                                    placeholder="Password"
                                    className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    required
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="px-2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={generatePassword}
                                className="mt-2 text-sm text-purple-600 hover:text-purple-800"
                            >
                                Generate secure password
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => {
                                setNewWorker({
                                    first_name: '',
                                    last_name: '',
                                    email: '',
                                    password: '',
                                    position: 'support_worker'
                                });
                            }}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
                        >
                            Clear Form
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-2 rounded-md transition-colors flex items-center"
                        >
                            {loading ? 'Creating...' : 'Create Support Worker'}
                            <UserPlus className="w-4 h-4 ml-2" />
                        </button>
                    </div>
                </form>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">👥 Support Worker Creation Guide</h3>
                <div className="text-sm text-blue-800 space-y-1">
                    <p>• Use work email addresses for all new support workers</p>
                    <p>• Generate secure passwords or allow workers to reset on first login</p>
                    <p>• New workers will receive login credentials via email</p>
                    <p>• They must complete their profile before accessing documents</p>
                </div>
            </div>
        </div>
    );

    // Documents section
    const DocumentsSection = () => (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Employment Documents</h2>
            {profileCompletion.mandatory_percentage === 100 ? (
                <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h3 className="text-green-800 font-medium">Documents Available</h3>
                        <p className="text-green-700 text-sm mt-1">
                            Your profile is complete! Access your employment documents below.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors cursor-pointer">
                            <FileText className="w-8 h-8 text-purple-600 mb-2" />
                            <h4 className="font-medium">Employment Contract</h4>
                            <p className="text-sm text-gray-600">Your signed employment agreement</p>
                            <button className="mt-2 text-xs bg-purple-100 hover:bg-purple-200 text-purple-800 px-3 py-1 rounded transition-colors">
                                Download
                            </button>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors cursor-pointer">
                            <FileText className="w-8 h-8 text-green-600 mb-2" />
                            <h4 className="font-medium">Policy Manual</h4>
                            <p className="text-sm text-gray-600">Company policies and procedures</p>
                            <button className="mt-2 text-xs bg-purple-100 hover:bg-purple-200 text-purple-800 px-3 py-1 rounded transition-colors">
                                Download
                            </button>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors cursor-pointer">
                            <FileText className="w-8 h-8 text-blue-600 mb-2" />
                            <h4 className="font-medium">Training Materials</h4>
                            <p className="text-sm text-gray-600">NDIS training and resources</p>
                            <button className="mt-2 text-xs bg-purple-100 hover:bg-purple-200 text-purple-800 px-3 py-1 rounded transition-colors">
                                Download
                            </button>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors cursor-pointer">
                            <FileText className="w-8 h-8 text-orange-600 mb-2" />
                            <h4 className="font-medium">Tax Forms</h4>
                            <p className="text-sm text-gray-600">Annual tax and payroll documents</p>
                            <button className="mt-2 text-xs bg-purple-100 hover:bg-purple-200 text-purple-800 px-3 py-1 rounded transition-colors">
                                Download
                            </button>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors cursor-pointer">
                            <FileText className="w-8 h-8 text-red-600 mb-2" />
                            <h4 className="font-medium">Safety Guidelines</h4>
                            <p className="text-sm text-gray-600">Workplace health and safety</p>
                            <button className="mt-2 text-xs bg-purple-100 hover:bg-purple-200 text-purple-800 px-3 py-1 rounded transition-colors">
                                Download
                            </button>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors cursor-pointer">
                            <FileText className="w-8 h-8 text-indigo-600 mb-2" />
                            <h4 className="font-medium">Benefits Guide</h4>
                            <p className="text-sm text-gray-600">Employee benefits and entitlements</p>
                            <button className="mt-2 text-xs bg-purple-100 hover:bg-purple-200 text-purple-800 px-3 py-1 rounded transition-colors">
                                Download
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Complete Your Profile First</h3>
                    <p className="text-gray-600 mb-4">
                        You need to complete {profileCompletion.mandatory_total - profileCompletion.mandatory_completed} more mandatory field{profileCompletion.mandatory_total - profileCompletion.mandatory_completed !== 1 ? 's' : ''} to access employment documents.
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
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors"
                    >
                        Complete Profile
                    </button>
                </div>
            )}
        </div>
    );

    // Schedule section (Support Workers only)
    const ScheduleSection = () => (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Schedule</h2>
            <div className="text-center py-8">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Shifts Scheduled</h3>
                <p className="text-gray-600">Your upcoming shifts and client appointments will appear here.</p>
                <div className="mt-4">
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors mr-2">
                        View Calendar
                    </button>
                    <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-colors">
                        Request Time Off
                    </button>
                </div>
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
            case 'add-worker':
                return isAdmin ? <AddSupportWorkerSection /> : <HomeSection />;
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
                                Casa Community Pty Ltd - {isAdmin ? 'Admin Panel' : 'Employee Portal'}
                            </h1>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="hidden sm:block text-right">
                                <p className="text-sm text-gray-600">Welcome, {user?.first_name}</p>
                                <p className="text-xs text-gray-500">{profileCompletion.overall_percentage}% complete</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
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

export default EmployeeDashboard;
