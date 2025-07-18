import React, { useState, useEffect, useCallback } from 'react';
import {
    User,
    // Mail,
    Phone,
    MapPin,
    Building2,
    CreditCard,
    Users,
    Shield,
    Calendar,
    AlertCircle,
    CheckCircle,
    Save,
    ArrowLeft,
    Eye,
    EyeOff,
    Info
} from 'lucide-react';
import { employeeService } from '../../../services/employeeService';

interface EmployeeProfileData {
    // Basic Info (Required)
    // first_name: string;
    // last_name: string;
    // email: string;
    date_of_birth: string;
    address: string;
    phone: string;
    tfn: string;

    // Location (Optional)
    suburb: string;
    state_territory: string;
    postcode: string;

    // Superannuation (Optional)
    fund_name: string;
    abn: string;
    member_number: string;

    // Bank Details (Required)
    bank_name: string;
    account_name: string;
    bsb: string;
    account_number: string;

    // Emergency Contact (Required)
    emergency_contact_first_name: string;
    emergency_contact_last_name: string;
    emergency_contact_number: string;
    emergency_contact_home: string;
    emergency_contact_relationship: string;
}

interface ProfileErrors {
    [key: string]: string;
}

interface ProfileCompletion {
    percentage: number;
    completedSections: string[];
    incompleteSections: string[];
}

const EmployeeProfile: React.FC<{ onBack?: () => void; onProfileComplete?: () => void }> = ({
    onBack,
    onProfileComplete
}) => {
    const [profileData, setProfileData] = useState<EmployeeProfileData>({
        // Basic Info
        // first_name: '',
        // last_name: '',
        // email: '',
        date_of_birth: '',
        address: '',
        phone: '',
        tfn: '',

        // Location
        suburb: '',
        state_territory: '',
        postcode: '',

        // Superannuation
        fund_name: '',
        abn: '',
        member_number: '',

        // Bank Details
        bank_name: '',
        account_name: '',
        bsb: '',
        account_number: '',

        // Emergency Contact
        emergency_contact_first_name: '',
        emergency_contact_last_name: '',
        emergency_contact_number: '',
        emergency_contact_home: '',
        emergency_contact_relationship: ''
    });

    const [errors, setErrors] = useState<ProfileErrors>({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showSensitiveData, setShowSensitiveData] = useState({
        tfn: false,
        bsb: false,
        account_number: false
    });

    // Calculate profile completion
    const calculateCompletion = useCallback((): ProfileCompletion => {
        const requiredFields = [
            'date_of_birth', 'address', 'phone', 'tfn',
            'bank_name', 'account_name', 'bsb', 'account_number',
            'emergency_contact_first_name', 'emergency_contact_number', 'emergency_contact_relationship'
        ];

        const optionalFields = [
            'suburb', 'state_territory', 'postcode',
            'fund_name', 'abn', 'member_number',
            'emergency_contact_last_name', 'emergency_contact_home'
        ];

        // const allFields = [...requiredFields, ...optionalFields];

        // Calculate completion
        const completedRequired = requiredFields.filter(field =>
            profileData[field as keyof EmployeeProfileData]?.toString().trim()
        ).length;

        const completedOptional = optionalFields.filter(field =>
            profileData[field as keyof EmployeeProfileData]?.toString().trim()
        ).length;

        const requiredPercentage = (completedRequired / requiredFields.length) * 80; // 80% for required
        const optionalPercentage = (completedOptional / optionalFields.length) * 20; // 20% for optional

        const totalPercentage = Math.round(requiredPercentage + optionalPercentage);

        // Define sections
        const sections = {
            'Basic Information': ['date_of_birth', 'address', 'phone', 'tfn'],
            'Location Details': ['suburb', 'state_territory', 'postcode'],
            'Superannuation': ['fund_name', 'abn', 'member_number'],
            'Bank Details': ['bank_name', 'account_name', 'bsb', 'account_number'],
            'Emergency Contact': ['emergency_contact_first_name', 'emergency_contact_last_name', 'emergency_contact_number', 'emergency_contact_home', 'emergency_contact_relationship']
        };

        const completedSections: string[] = [];
        const incompleteSections: string[] = [];

        Object.entries(sections).forEach(([sectionName, fields]) => {
            // const sectionFields = fields.filter(field =>
            //     profileData[field as keyof EmployeeProfileData]?.toString().trim()
            // );

            // Section is complete if all required fields are filled
            const requiredInSection = fields.filter(field => requiredFields.includes(field));
            const completedRequiredInSection = requiredInSection.filter(field =>
                profileData[field as keyof EmployeeProfileData]?.toString().trim()
            );

            if (requiredInSection.length === completedRequiredInSection.length) {
                completedSections.push(sectionName);
            } else {
                incompleteSections.push(sectionName);
            }
        });

        return {
            percentage: totalPercentage,
            completedSections,
            incompleteSections
        };
    }, [profileData]);

    const completion = calculateCompletion();

    // Load existing profile data
    useEffect(() => {
        const loadProfile = async () => {
            setLoading(true);
            try {
                // Get user data from token or storage
                const userData = JSON.parse(localStorage.getItem('user_data') || '{}');

                setProfileData(prev => ({
                    ...prev,
                    first_name: userData.first_name || '',
                    last_name: userData.last_name || '',
                    email: userData.email || userData.work_email || '',
                }));

                // Try to load existing profile
                // const profile = await employeeService.getProfile();
                // if (profile) {
                //   setProfileData(profile);
                // }
            } catch (error) {
                console.error('Failed to load profile:', error);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    // Handle input changes
    const handleInputChange = (field: keyof EmployeeProfileData, value: string) => {
        setProfileData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: ProfileErrors = {};

        // Required field validation
        const requiredFields = {
            // first_name: 'First name is required',
            // last_name: 'Last name is required',
            // email: 'Email is required',
            date_of_birth: 'Date of birth is required',
            address: 'Address is required',
            phone: 'Phone number is required',
            tfn: 'Tax File Number is required',
            bank_name: 'Bank name is required',
            account_name: 'Account name is required',
            bsb: 'BSB is required',
            account_number: 'Account number is required',
            emergency_contact_first_name: 'Emergency contact first name is required',
            emergency_contact_number: 'Emergency contact number is required',
            emergency_contact_relationship: 'Emergency contact relationship is required'
        };

        // Check required fields
        Object.entries(requiredFields).forEach(([field, message]) => {
            if (!profileData[field as keyof EmployeeProfileData]?.toString().trim()) {
                newErrors[field] = message;
            }
        });

        // Email validation
        // if (profileData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
        //     newErrors.email = 'Please enter a valid email address';
        // }

        // Phone validation
        if (profileData.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(profileData.phone)) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        // TFN validation
        const tfn = profileData.tfn.replace(/\s/g, '');
        if (profileData.tfn && (!/^\d{9}$/.test(tfn))) {
            newErrors.tfn = 'TFN must be exactly 9 digits';
        }

        // BSB validation
        const bsb = profileData.bsb.replace(/[\s\-]/g, '');
        if (profileData.bsb && (!/^\d{6}$/.test(bsb))) {
            newErrors.bsb = 'BSB must be exactly 6 digits';
        }

        // Account number validation
        const accountNumber = profileData.account_number.replace(/\s/g, '');
        if (profileData.account_number && (!/^\d{1,10}$/.test(accountNumber))) {
            newErrors.account_number = 'Account number must be 1-10 digits';
        }

        // Date validation
        if (profileData.date_of_birth) {
            const birthDate = new Date(profileData.date_of_birth);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();

            if (age < 16 || age > 100) {
                newErrors.date_of_birth = 'Please enter a valid date of birth';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSaving(true);
        try {
            // Format data for API
            const apiData = {
                ...profileData,
                // Remove spaces/dashes from sensitive fields
                tfn: profileData.tfn.replace(/\s/g, ''),
                bsb: profileData.bsb.replace(/[\s\-]/g, ''),
                account_number: profileData.account_number.replace(/\s/g, ''),
            };

            const response = await employeeService.createUpdateProfile(apiData);

            if (response.success) {
                // Success notification
                alert('Profile saved successfully!');

                // Check if profile is now complete
                if (completion.percentage >= 80) { // 80% for all required fields
                    onProfileComplete?.();
                }
            }
        } catch (error: any) {
            console.error('Profile save error:', error);

            if (error.response?.data?.field_errors) {
                setErrors(error.response.data.field_errors);
            } else {
                alert('Failed to save profile. Please try again.');
            }
        } finally {
            setSaving(false);
        }
    };

    const toggleSensitiveData = (field: keyof typeof showSensitiveData) => {
        setShowSensitiveData(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        {onBack && (
                            <button
                                title='arrow-left'
                                onClick={onBack}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        )}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Employee Profile</h2>
                            <p className="text-gray-600">Complete your employment information</p>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Profile Completion</span>
                        <span className="text-sm font-medium text-emerald-600">{completion.percentage}%</span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${completion.percentage}%` }}
                        />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">
                            {completion.completedSections.length} of 5 sections completed
                        </span>
                        {completion.percentage >= 80 && (
                            <span className="flex items-center text-green-600 font-medium">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Profile Complete
                            </span>
                        )}
                    </div>
                </div>

                {/* Section Status */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mt-4">
                    {['Basic Information', 'Location Details', 'Superannuation', 'Bank Details', 'Emergency Contact'].map((section) => (
                        <div
                            key={section}
                            className={`text-center p-2 rounded-lg text-xs font-medium ${completion.completedSections.includes(section)
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-orange-100 text-orange-700'
                                }`}
                        >
                            {section}
                        </div>
                    ))}
                </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-3 mb-6">
                        <User className="w-6 h-6 text-emerald-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                        <span className="text-red-500 text-sm">* Required</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                First Name *
                            </label>
                            <input
                                type="text"
                                value={profileData.first_name}
                                onChange={(e) => handleInputChange('first_name', e.target.value)}
                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${errors.first_name ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                placeholder="Enter your first name"
                            />
                            {errors.first_name && (
                                <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                            )}
                        </div> */}

                        {/* <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Last Name *
                            </label>
                            <input
                                type="text"
                                value={profileData.last_name}
                                onChange={(e) => handleInputChange('last_name', e.target.value)}
                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${errors.last_name ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                placeholder="Enter your last name"
                            />
                            {errors.last_name && (
                                <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                            )}
                        </div> */}

                        {/* <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address *
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={profileData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className={`w-full px-4 py-3 pl-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${errors.email ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="your.email@casacommunity.com.au"
                                />
                                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div> */}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date of Birth *
                            </label>
                            <div className="relative">
                                <input
                                    title='date'
                                    type="date"
                                    value={profileData.date_of_birth}
                                    onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                                    className={`w-full px-4 py-3 pl-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${errors.date_of_birth ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                />
                                <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                            </div>
                            {errors.date_of_birth && (
                                <p className="mt-1 text-sm text-red-600">{errors.date_of_birth}</p>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Address *
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={profileData.address}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                    className={`w-full px-4 py-3 pl-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${errors.address ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="123 Main Street, Adelaide SA 5000"
                                />
                                <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                            </div>
                            {errors.address && (
                                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number *
                            </label>
                            <div className="relative">
                                <input
                                    type="tel"
                                    value={profileData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    className={`w-full px-4 py-3 pl-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${errors.phone ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="+61 412 345 678"
                                />
                                <Phone className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                            </div>
                            {errors.phone && (
                                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tax File Number (TFN) *
                            </label>
                            <div className="relative">
                                <input
                                    type={showSensitiveData.tfn ? 'text' : 'password'}
                                    value={profileData.tfn}
                                    onChange={(e) => handleInputChange('tfn', e.target.value)}
                                    className={`w-full px-4 py-3 pl-12 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${errors.tfn ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="123 456 789"
                                    maxLength={9}
                                />
                                <Shield className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                <button
                                    type="button"
                                    onClick={() => toggleSensitiveData('tfn')}
                                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                                >
                                    {showSensitiveData.tfn ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.tfn && (
                                <p className="mt-1 text-sm text-red-600">{errors.tfn}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">9 digits only</p>
                        </div>
                    </div>
                </div>

                {/* Location Details */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-3 mb-6">
                        <MapPin className="w-6 h-6 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Location Details</h3>
                        <span className="text-gray-500 text-sm">Optional</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Suburb
                            </label>
                            <select
                                title='suburb'
                                value={profileData.suburb}
                                onChange={(e) => handleInputChange('state_territory', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                            >
                                <option value="">Select State</option>
                                <option value="Melbourne">Melbourne</option>
                                <option value="Sydney">Sydney</option>
                                <option value="Brisbane">Brisbane</option>
                                <option value="Perth">Perth</option>
                                <option value="Adelaide">Adelaide</option>
                                <option value="Gold Coast">Gold Coast</option>
                                <option value="New Castle">New Castle</option>
                                <option value="Canberra">Canberra</option>
                                <option value="Hobart">Hobart</option>
                                <option value="Darwin">Darwin</option>
                                <option value="Townsville">Townsville</option>
                                <option value="Geelong">Geelong</option>
                                {/* ('MELBOURNE', 'Melbourne'),
                                ('SYDNEY', 'Sydney'),
                                ('BRISBANE', 'Brisbane'),
                                ('PERTH', 'Perth'),
                                ('ADELAIDE', 'Adelaide'),
                                ('GOLD_COAST', 'Gold Coast'),
                                ('NEWCASTLE', 'Newcastle'),
                                ('CANBERRA', 'Canberra'),
                                ('HOBART', 'Hobart'),
                                ('DARWIN', 'Darwin'),
                                ('TOWNSVILLE', 'Townsville'),
                                ('GEELONG', 'Geelong'), */}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                State/Territory
                            </label>
                            <select
                                title='state/territory'
                                value={profileData.state_territory}
                                onChange={(e) => handleInputChange('state_territory', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                            >
                                <option value="">Select State</option>
                                <option value="NSW">NSW</option>
                                <option value="VIC">VIC</option>
                                <option value="QLD">QLD</option>
                                <option value="WA">WA</option>
                                <option value="SA">SA</option>
                                <option value="TAS">TAS</option>
                                <option value="ACT">ACT</option>
                                <option value="NT">NT</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Postcode
                            </label>
                            <input
                                type="text"
                                value={profileData.postcode}
                                onChange={(e) => handleInputChange('postcode', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                                placeholder="5000"
                                maxLength={4}
                            />
                        </div>
                    </div>
                </div>

                {/* Superannuation */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-3 mb-6">
                        <Building2 className="w-6 h-6 text-purple-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Superannuation</h3>
                        <span className="text-gray-500 text-sm">Optional</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fund Name
                            </label>
                            <input
                                type="text"
                                value={profileData.fund_name}
                                onChange={(e) => handleInputChange('fund_name', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                                placeholder="Australian Super"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ABN
                            </label>
                            <input
                                type="text"
                                value={profileData.abn}
                                onChange={(e) => handleInputChange('abn', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                                placeholder="123 456 789 012"
                                maxLength={14}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Member Number
                            </label>
                            <input
                                type="text"
                                value={profileData.member_number}
                                onChange={(e) => handleInputChange('member_number', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                                placeholder="12345"
                            />
                        </div>
                    </div>
                </div>

                {/* Bank Details */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-3 mb-6">
                        <CreditCard className="w-6 h-6 text-green-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Bank Details</h3>
                        <span className="text-red-500 text-sm">* Required</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Bank Name *
                            </label>
                            <input
                                type="text"
                                value={profileData.bank_name}
                                onChange={(e) => handleInputChange('bank_name', e.target.value)}
                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${errors.bank_name ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                placeholder="Commonwealth Bank"
                            />
                            {errors.bank_name && (
                                <p className="mt-1 text-sm text-red-600">{errors.bank_name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Account Name *
                            </label>
                            <input
                                type="text"
                                value={profileData.account_name}
                                onChange={(e) => handleInputChange('account_name', e.target.value)}
                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${errors.account_name ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                placeholder="John Smith"
                            />
                            {errors.account_name && (
                                <p className="mt-1 text-sm text-red-600">{errors.account_name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                BSB *
                            </label>
                            <div className="relative">
                                <input
                                    type={showSensitiveData.bsb ? 'text' : 'password'}
                                    value={profileData.bsb}
                                    onChange={(e) => handleInputChange('bsb', e.target.value)}
                                    className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${errors.bsb ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="063-000"
                                    maxLength={7}
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleSensitiveData('bsb')}
                                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                                >
                                    {showSensitiveData.bsb ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.bsb && (
                                <p className="mt-1 text-sm text-red-600">{errors.bsb}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">6 digits only</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Account Number *
                            </label>
                            <div className="relative">
                                <input
                                    type={showSensitiveData.account_number ? 'text' : 'password'}
                                    value={profileData.account_number}
                                    onChange={(e) => handleInputChange('account_number', e.target.value)}
                                    className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${errors.account_number ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="1234567890"
                                    maxLength={10}
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleSensitiveData('account_number')}
                                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                                >
                                    {showSensitiveData.account_number ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.account_number && (
                                <p className="mt-1 text-sm text-red-600">{errors.account_number}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">Up to 10 digits</p>
                        </div>
                    </div>

                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start space-x-3">
                            <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div>
                                <h4 className="text-yellow-800 font-medium">Security Notice</h4>
                                <p className="text-yellow-700 text-sm mt-1">
                                    Your banking information is encrypted and securely stored. This information is required for payroll processing.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Emergency Contact */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-3 mb-6">
                        <Users className="w-6 h-6 text-red-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Emergency Contact</h3>
                        <span className="text-red-500 text-sm">* Required</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                First Name *
                            </label>
                            <input
                                type="text"
                                value={profileData.emergency_contact_first_name}
                                onChange={(e) => handleInputChange('emergency_contact_first_name', e.target.value)}
                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${errors.emergency_contact_first_name ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                placeholder="Jane"
                            />
                            {errors.emergency_contact_first_name && (
                                <p className="mt-1 text-sm text-red-600">{errors.emergency_contact_first_name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Last Name
                            </label>
                            <input
                                type="text"
                                value={profileData.emergency_contact_last_name}
                                onChange={(e) => handleInputChange('emergency_contact_last_name', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                                placeholder="Smith"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mobile Number *
                            </label>
                            <div className="relative">
                                <input
                                    type="tel"
                                    value={profileData.emergency_contact_number}
                                    onChange={(e) => handleInputChange('emergency_contact_number', e.target.value)}
                                    className={`w-full px-4 py-3 pl-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${errors.emergency_contact_number ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="+61 412 345 679"
                                />
                                <Phone className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                            </div>
                            {errors.emergency_contact_number && (
                                <p className="mt-1 text-sm text-red-600">{errors.emergency_contact_number}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Home Number
                            </label>
                            <div className="relative">
                                <input
                                    type="tel"
                                    value={profileData.emergency_contact_home}
                                    onChange={(e) => handleInputChange('emergency_contact_home', e.target.value)}
                                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                                    placeholder="+61 8 1234 5678"
                                />
                                <Phone className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Relationship *
                            </label>
                            <select
                                title='relationship'
                                value={profileData.emergency_contact_relationship}
                                onChange={(e) => handleInputChange('emergency_contact_relationship', e.target.value)}
                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${errors.emergency_contact_relationship ? 'border-red-300' : 'border-gray-300'
                                    }`}
                            >
                                <option value="">Select Relationship</option>
                                <option value="Spouse">Spouse</option>
                                <option value="Partner">Partner</option>
                                <option value="Parent">Parent</option>
                                <option value="Child">Child</option>
                                <option value="Sibling">Sibling</option>
                                <option value="Friend">Friend</option>
                                <option value="Other Family">Other Family</option>
                                <option value="Guardian">Guardian</option>
                            </select>
                            {errors.emergency_contact_relationship && (
                                <p className="mt-1 text-sm text-red-600">{errors.emergency_contact_relationship}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            {completion.percentage >= 80 ? (
                                <CheckCircle className="w-6 h-6 text-green-500" />
                            ) : (
                                <AlertCircle className="w-6 h-6 text-orange-500" />
                            )}
                            <div>
                                <p className="font-medium text-gray-900">
                                    {completion.percentage >= 80 ? 'Profile Complete!' : 'Profile Incomplete'}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {completion.percentage >= 80
                                        ? 'All required fields completed. You can now access all features.'
                                        : `Complete ${completion.incompleteSections.length} more section${completion.incompleteSections.length !== 1 ? 's' : ''} to unlock all features.`
                                    }
                                </p>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-colors ${saving
                                    ? 'bg-gray-400 text-white cursor-not-allowed'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2'
                                }`}
                        >
                            {saving ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    <span>Save Profile</span>
                                </>
                            )}
                        </button>
                    </div>

                    {completion.incompleteSections.length > 0 && (
                        <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                            <h4 className="text-orange-800 font-medium mb-2">Incomplete Sections:</h4>
                            <ul className="text-orange-700 text-sm space-y-1">
                                {completion.incompleteSections.map((section) => (
                                    <li key={section}>• {section}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
};

export default EmployeeProfile;
