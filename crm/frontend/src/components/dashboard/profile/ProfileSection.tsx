// components/dashboard/profile/ProfileSection.tsx
import React, { useState } from 'react';
import {
    User,
    Shield,
    Phone,
    Heart,
    CreditCard,
    Activity,
    Save,
    // Camera,
    Check,
    AlertCircle
} from 'lucide-react';
import type{ ParticipantProfile } from '../../../types/profile.types';

interface ProfileSectionProps {
    participantProfile: ParticipantProfile;
    profilePicturePreview: string | null;
    completionPercentage: number;
    loading: boolean;
    onProfileChange: (field: string, value: string | boolean | File) => void;
    onProfilePictureChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSaveLocally: () => void;
    onSaveToBackend: () => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
    participantProfile,
    profilePicturePreview,
    completionPercentage,
    loading,
    onProfileChange,
    onProfilePictureChange,
    onSaveLocally,
    onSaveToBackend
}) => {
    const [activeStep, setActiveStep] = useState("basic");

    const profileSteps = [
        { id: "basic", label: "Basic Info", icon: User, description: "Essential personal information", required: true },
        { id: "personal", label: "Personal Details", icon: User, description: "Additional personal information", required: false },
        { id: "ndis", label: "NDIS Details", icon: Shield, description: "NDIS plan information", required: true },
        { id: "emergency", label: "Emergency & Guardian", icon: Phone, description: "Emergency contacts", required: true },
        { id: "medical", label: "Medical Info", icon: Heart, description: "Health and medical details", required: false },
        { id: "cards", label: "Cards & Insurance", icon: CreditCard, description: "Insurance and card details", required: false },
        { id: "support", label: "Support Needs", icon: Activity, description: "Support requirements", required: false },
    ];

    const mandatoryFields = [
        "preferred_name",
        "date_of_birth",
        "address",
        "phone",
        "ndis_number",
        "ndis_plan_start",
        "ndis_plan_end",
        "ndis_plan_managed_details",
        "emergency_contact_1",
        "emergency_contact_2",
        "guardian_name",
        "guardian_address",
        "guardian_contact",
    ];

    const renderBasicInfo = () => (
        <div className="space-y-6">
            {/* Profile Picture Upload */}
            <div className="flex items-center space-x-6">
                <div className="w-24 h-24 rounded-full bg-dodo-cream border-2 border-dodo-gray/20 flex items-center justify-center overflow-hidden">
                    {profilePicturePreview ? (
                        <img
                            src={profilePicturePreview}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <User className="w-10 h-10 text-dodo-gray" />
                    )}
                </div>
                <div>
                    <label className="block text-sm font-subheading font-medium text-dodo-black mb-2">
                        Profile Picture
                    </label>
                    <input
                        title='profile-picture'
                        type="file"
                        accept="image/*"
                        onChange={onProfilePictureChange}
                        className="block w-full text-sm text-dodo-gray font-body file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-dodo-cream file:text-dodo-black hover:file:bg-dodo-gray hover:file:text-white transition-colors"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-subheading font-medium text-dodo-black mb-1">
                        Preferred Name *
                    </label>
                    <input
                        type="text"
                        value={participantProfile.preferred_name}
                        onChange={(e) => onProfileChange("preferred_name", e.target.value)}
                        className="w-full px-4 py-3 border border-dodo-gray/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-dodo-gray/50 focus:border-dodo-black font-body bg-white"
                        placeholder="What would you like us to call you?"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-subheading font-medium text-dodo-black mb-1">
                        Date of Birth *
                    </label>
                    <input
                        title='dob'
                        type="date"
                        value={participantProfile.date_of_birth}
                        onChange={(e) => onProfileChange("date_of_birth", e.target.value)}
                        className="w-full px-4 py-3 border border-dodo-gray/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-dodo-gray/50 focus:border-dodo-black font-body bg-white"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-subheading font-medium text-dodo-black mb-1">
                        Phone Number *
                    </label>
                    <input
                        type="tel"
                        value={participantProfile.phone}
                        onChange={(e) => onProfileChange("phone", e.target.value)}
                        className="w-full px-4 py-3 border border-dodo-gray/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-dodo-gray/50 focus:border-dodo-black font-body bg-white"
                        placeholder="+61 4XX XXX XXX"
                        required
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-subheading font-medium text-dodo-black mb-1">
                    Address *
                </label>
                <textarea
                    value={participantProfile.address}
                    onChange={(e) => onProfileChange("address", e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-dodo-gray/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-dodo-gray/50 focus:border-dodo-black font-body bg-white"
                    placeholder="Full residential address"
                    required
                />
            </div>
        </div>
    );

    const renderPersonalDetails = () => (
        <div className="space-y-4">
            <div className="bg-dodo-cream/30 border border-dodo-gray/20 rounded-xl p-4 mb-4">
                <p className="text-dodo-black text-sm font-body">
                    <User className="w-4 h-4 inline mr-1" />
                    Personal details help us provide better support. All fields are optional.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-subheading font-medium text-dodo-black mb-1">
                        Gender
                    </label>
                    <select
                        title='gender'
                        value={participantProfile.gender}
                        onChange={(e) => onProfileChange("gender", e.target.value)}
                        className="w-full px-4 py-3 border border-dodo-gray/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-dodo-gray/50 focus:border-dodo-black font-body bg-white"
                    >
                        <option value="">Select Gender</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Other</option>
                        <option value="P">Prefer not to say</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-subheading font-medium text-dodo-black mb-1">
                        Spoken Language
                    </label>
                    <input
                        type="text"
                        value={participantProfile.spoken_language}
                        onChange={(e) => onProfileChange("spoken_language", e.target.value)}
                        className="w-full px-4 py-3 border border-dodo-gray/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-dodo-gray/50 focus:border-dodo-black font-body bg-white"
                        placeholder="Primary language spoken"
                    />
                </div>
                <div>
                    <label className="block text-sm font-subheading font-medium text-dodo-black mb-1">
                        Height (cm)
                    </label>
                    <input
                        type="number"
                        value={participantProfile.height}
                        onChange={(e) => onProfileChange("height", e.target.value)}
                        className="w-full px-4 py-3 border border-dodo-gray/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-dodo-gray/50 focus:border-dodo-black font-body bg-white"
                        placeholder="Height in centimeters"
                    />
                </div>
                <div>
                    <label className="block text-sm font-subheading font-medium text-dodo-black mb-1">
                        Weight (kg)
                    </label>
                    <input
                        type="number"
                        value={participantProfile.weight}
                        onChange={(e) => onProfileChange("weight", e.target.value)}
                        className="w-full px-4 py-3 border border-dodo-gray/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-dodo-gray/50 focus:border-dodo-black font-body bg-white"
                        placeholder="Weight in kilograms"
                    />
                </div>
            </div>
        </div>
    );

    const renderNDISInfo = () => (
        <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <p className="text-red-800 text-sm font-body">
                    <Shield className="w-4 h-4 inline mr-1" />
                    NDIS information is mandatory and required for all services.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-subheading font-medium text-dodo-black mb-1">
                        NDIS Number *
                    </label>
                    <input
                        type="text"
                        value={participantProfile.ndis_number}
                        onChange={(e) => onProfileChange("ndis_number", e.target.value)}
                        className="w-full px-4 py-3 border border-dodo-gray/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-dodo-gray/50 focus:border-dodo-black font-body bg-white"
                        placeholder="Your NDIS participant number"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-subheading font-medium text-dodo-black mb-1">
                        Plan Start Date *
                    </label>
                    <input
                        title='plan-start-date'
                        type="date"
                        value={participantProfile.ndis_plan_start}
                        onChange={(e) => onProfileChange("ndis_plan_start", e.target.value)}
                        className="w-full px-4 py-3 border border-dodo-gray/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-dodo-gray/50 focus:border-dodo-black font-body bg-white"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-subheading font-medium text-dodo-black mb-1">
                        Plan End Date *
                    </label>
                    <input
                        title='plan-end-date'
                        type="date"
                        value={participantProfile.ndis_plan_end}
                        onChange={(e) => onProfileChange("ndis_plan_end", e.target.value)}
                        className="w-full px-4 py-3 border border-dodo-gray/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-dodo-gray/50 focus:border-dodo-black font-body bg-white"
                        required
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-subheading font-medium text-dodo-black mb-1">
                    Plan Management Details *
                </label>
                <textarea
                    value={participantProfile.ndis_plan_managed_details}
                    onChange={(e) => onProfileChange("ndis_plan_managed_details", e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-dodo-gray/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-dodo-gray/50 focus:border-dodo-black font-body bg-white"
                    placeholder="How is your NDIS plan managed? (Self-managed, Plan-managed, NDIA-managed)"
                    required
                />
            </div>
        </div>
    );

    const renderEmergencyContacts = () => (
        <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-800 text-sm font-body">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Emergency contacts and guardian information are mandatory for safety and compliance.
                </p>
            </div>

            {/* Emergency Contacts */}
            <div>
                <h4 className="font-subheading font-medium text-dodo-black mb-4">Emergency Contacts</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-subheading font-medium text-dodo-black mb-1">
                            Emergency Contact 1 *
                        </label>
                        <input
                            type="tel"
                            value={participantProfile.emergency_contact_1}
                            onChange={(e) => onProfileChange("emergency_contact_1", e.target.value)}
                            className="w-full px-4 py-3 border border-dodo-gray/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-dodo-gray/50 focus:border-dodo-black font-body bg-white"
                            placeholder="Primary emergency contact number"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-subheading font-medium text-dodo-black mb-1">
                            Emergency Contact 2 *
                        </label>
                        <input
                            type="tel"
                            value={participantProfile.emergency_contact_2}
                            onChange={(e) => onProfileChange("emergency_contact_2", e.target.value)}
                            className="w-full px-4 py-3 border border-dodo-gray/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-dodo-gray/50 focus:border-dodo-black font-body bg-white"
                            placeholder="Secondary emergency contact number"
                            required
                        />
                    </div>
                </div>
            </div>

            {/* Guardian Information */}
            <div>
                <h4 className="font-subheading font-medium text-dodo-black mb-4">Guardian/Representative Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-subheading font-medium text-dodo-black mb-1">
                            Guardian Name *
                        </label>
                        <input
                            type="text"
                            value={participantProfile.guardian_name}
                            onChange={(e) => onProfileChange("guardian_name", e.target.value)}
                            className="w-full px-4 py-3 border border-dodo-gray/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-dodo-gray/50 focus:border-dodo-black font-body bg-white"
                            placeholder="Full name of guardian/representative"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-subheading font-medium text-dodo-black mb-1">
                            Guardian Contact *
                        </label>
                        <input
                            type="tel"
                            value={participantProfile.guardian_contact}
                            onChange={(e) => onProfileChange("guardian_contact", e.target.value)}
                            className="w-full px-4 py-3 border border-dodo-gray/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-dodo-gray/50 focus:border-dodo-black font-body bg-white"
                            placeholder="Guardian phone number"
                            required
                        />
                    </div>
                </div>
                <div className="mt-4">
                    <label className="block text-sm font-subheading font-medium text-dodo-black mb-1">
                        Guardian Address *
                    </label>
                    <textarea
                        value={participantProfile.guardian_address}
                        onChange={(e) => onProfileChange("guardian_address", e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-dodo-gray/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-dodo-gray/50 focus:border-dodo-black font-body bg-white"
                        placeholder="Guardian's residential address"
                        required
                    />
                </div>
            </div>
        </div>
    );

    const renderActiveStep = () => {
        switch (activeStep) {
            case "basic":
                return renderBasicInfo();
            case "personal":
                return renderPersonalDetails();
            case "ndis":
                return renderNDISInfo();
            case "emergency":
                return renderEmergencyContacts();
            case "medical":
                return <div className="p-8 text-center text-dodo-gray font-body">Medical Info section - Coming soon</div>;
            case "cards":
                return <div className="p-8 text-center text-dodo-gray font-body">Cards & Insurance section - Coming soon</div>;
            case "support":
                return <div className="p-8 text-center text-dodo-gray font-body">Support Needs section - Coming soon</div>;
            default:
                return renderBasicInfo();
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-heading font-bold text-dodo-black">
                        Complete Your Profile
                    </h2>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-dodo-black">
                            {completionPercentage}%
                        </span>
                        <p className="text-sm text-dodo-gray font-body">Complete</p>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {profileSteps.map((step) => {
                        const IconComponent = step.icon;
                        const isActive = activeStep === step.id;
                        return (
                            <button
                                key={step.id}
                                onClick={() => setActiveStep(step.id)}
                                className={`flex items-center px-3 py-2 rounded-xl text-xs font-subheading font-medium transition-colors ${isActive
                                        ? "bg-dodo-cream text-dodo-black border border-dodo-gray/30"
                                        : "bg-gray-100 text-dodo-gray hover:bg-dodo-cream/50"
                                    }`}
                            >
                                <IconComponent className="w-3 h-3 mr-1" />
                                {step.label}
                                {step.required && <span className="text-dodo-red ml-1">*</span>}
                            </button>
                        );
                    })}
                </div>

                {/* Form Content */}
                <div className="mb-6">
                    <h3 className="text-lg font-subheading font-semibold text-dodo-black mb-4">
                        {profileSteps.find((step) => step.id === activeStep)?.label}
                    </h3>
                    {renderActiveStep()}
                </div>

                {/* Navigation and Save Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-dodo-gray/20">
                    <div className="flex gap-2">
                        {profileSteps.map((step, index) => {
                            if (step.id === activeStep && index > 0) {
                                return (
                                    <button
                                        key="prev"
                                        type="button"
                                        onClick={() => setActiveStep(profileSteps[index - 1].id)}
                                        className="px-4 py-2 bg-dodo-cream hover:bg-dodo-gray hover:text-white text-dodo-black rounded-xl transition-colors text-sm font-body"
                                    >
                                        Previous
                                    </button>
                                );
                            }
                            if (step.id === activeStep && index < profileSteps.length - 1) {
                                return (
                                    <button
                                        key="next"
                                        type="button"
                                        onClick={() => setActiveStep(profileSteps[index + 1].id)}
                                        className="px-4 py-2 bg-dodo-gray hover:bg-dodo-black text-white rounded-xl transition-colors text-sm font-body"
                                    >
                                        Next
                                    </button>
                                );
                            }
                            return null;
                        })}
                    </div>

                    <div className="flex-1" />

                    <div className="flex gap-2">
                        {/* Save Progress Button */}
                        <button
                            type="button"
                            onClick={onSaveLocally}
                            className="bg-dodo-cream hover:bg-dodo-gray hover:text-white text-dodo-black px-4 py-2 rounded-xl transition-colors flex items-center text-sm font-body"
                        >
                            <Save className="w-3 h-3 mr-1" />
                            Save Progress
                        </button>

                        {/* Save to Backend Button */}
                        <button
                            type="button"
                            onClick={onSaveToBackend}
                            disabled={loading || completionPercentage < 100}
                            className={`px-6 py-2 rounded-xl transition-colors flex items-center font-body ${completionPercentage === 100
                                    ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white'
                                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                }`}
                            title={completionPercentage < 100 ? 'Complete all mandatory fields first' : 'Save to backend'}
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    {completionPercentage === 100 ? 'Save to Backend' : `Complete Profile (${completionPercentage}%)`}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Completion Status */}
            {completionPercentage === 100 ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                        <Check className="w-5 h-5 text-green-600" />
                        <div>
                            <h4 className="text-green-800 font-subheading font-medium">Profile Complete! 🎉</h4>
                            <p className="text-green-700 text-sm font-body">All required information is complete. You can now access all services.</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                        <div>
                            <h4 className="text-amber-800 font-subheading font-medium">Complete Your Profile</h4>
                            <p className="text-amber-700 text-sm font-body">Complete all mandatory fields ({mandatoryFields.length} total) to access NDIS services.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileSection;
