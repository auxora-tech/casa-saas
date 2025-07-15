// hooks/useProfileManagement.tsx
import { useState, useEffect, useCallback } from 'react';
import type { ParticipantProfile } from '../types/profile.types';

// Mandatory fields for completion calculation
const MANDATORY_FIELDS = [
    "id",
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

const INITIAL_PROFILE: ParticipantProfile = {
    // Basic Info
    id: null,
    preferred_name: "",
    date_of_birth: "",
    address: "",
    phone: "",
    photo: null,

    // Personal Details
    gender: "",
    height: "",
    weight: "",
    hair_colour: "",
    eye_colour: "",
    spoken_language: "",
    distinguishing_features: "",
    clothing_size: "",
    shoe_size: "",
    religion_or_culture: "",

    // NDIS Info
    ndis_number: "",
    ndis_plan_start: "",
    ndis_plan_end: "",
    ndis_plan_managed_details: "",

    // Cards & Insurance
    pension_type: "",
    pension_number: "",
    pension_expiry: "",
    private_insurance_type: "",
    private_insurance_number: "",
    private_insurance_expiry: "",
    medicare_number: "",
    medicare_expiry: "",
    healthcare_card_number: "",
    healthcare_card_expiry: "",
    companion_card_number: "",
    companion_card_expiry: "",

    // Emergency Contacts & Guardian
    emergency_contact_1: "",
    emergency_contact_2: "",
    guardian_name: "",
    guardian_address: "",
    guardian_contact: "",

    // Medical Requirements
    name_of_doctor: "",
    medical_food_other_allergies: "",
    medical_condition: "",
    dietary_requirements: "",

    // About Me
    likes: "",
    dislikes: "",
    hobbies_interests: "",
    supports_required: "",
    level_assistance_required: "",

    // Support Needs - Boolean fields
    opg_guardian_consent_required: false,
    opg_guardian_consent_required_details: "",
    public_trustee_or_financial_administrator: false,
    public_trustee_or_financial_administrator_details: "",
    behaviour_management: false,
    behaviour_management_details: "",
    restrictive_practices: false,
    restrictive_practices_details: "",
    complex_health_support_plan: false,
    complex_health_support_plan_details: "",
    unsupported_time: false,
    unsupported_time_details: "",
    mobility: false,
    mobility_details: "",
    aids_equipment: false,
    aids_equipment_details: "",
    communication: false,
    communication_details: "",
    eating: false,
    eating_details: "",
    menstrual_management: false,
    menstrual_management_details: "",
    toileting: false,
    toileting_details: "",
    getting_drinks: false,
    getting_drinks_details: "",
    food_preparation: false,
    food_preparation_details: "",
    dressing: false,
    dressing_details: "",
    showering_or_bathing: false,
    showering_or_bathing_details: "",
    medication: false,
    medication_details: "",
    friendships_or_relationships: false,
    friendships_or_relationships_details: "",
    home_safety_and_security: false,
    home_safety_and_security_details: "",
    community_access: false,
    community_access_details: "",
    personal_or_road_safety: false,
    personal_or_road_safety_details: "",
    transport_or_travel: false,
    transport_or_travel_details: "",
    chores: false,
    chores_details: "",
    hobbies_or_activities: false,
    hobbies_or_activities_details: "",
    pet_care: false,
    pet_care_details: "",
    handling_money_or_budgeting: false,
    handling_money_or_budgeting_details: "",
    education_or_employment: false,
    education_or_employment_details: "",
    learning_new_skills: false,
    learning_new_skills_details: "",
    other_needs_and_support: false,
    other_needs_and_support_details: "",

    // Profile Status
    is_profile_completed: false,
};

export const useProfileManagement = (userId?: number) => {
    const [participantProfile, setParticipantProfile] = useState<ParticipantProfile>(INITIAL_PROFILE);
    const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Calculate completion percentage
    const completionPercentage = useCallback(() => {
        const completed = MANDATORY_FIELDS.filter((field) => {
            const value = participantProfile[field as keyof ParticipantProfile];
            return value && value.toString().trim() !== "";
        });
        return Math.round((completed.length / MANDATORY_FIELDS.length) * 100);
    }, [participantProfile]);

    // Load saved data from localStorage
    useEffect(() => {
        if (userId) {
            const savedProfile = localStorage.getItem(`participant_${userId}`);
            if (savedProfile) {
                try {
                    const parsedProfile = JSON.parse(savedProfile);
                    setParticipantProfile(parsedProfile);
                    if (parsedProfile.photo && typeof parsedProfile.photo === "string") {
                        setProfilePicturePreview(parsedProfile.photo);
                    }
                } catch (error) {
                    console.error("Failed to load saved profile:", error);
                }
            }
        }
    }, [userId]);

    // Handle profile field changes
    const handleProfileChange = useCallback((field: string, value: string | boolean | File) => {
        setParticipantProfile((prev) => ({
            ...prev,
            [field]: value,
        }));
    }, []);

    // Handle profile picture upload
    const handleProfilePictureChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setParticipantProfile((prev) => ({
                ...prev,
                photo: file,
            }));

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setProfilePicturePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    }, []);

    // Save progress locally
    const saveProgressLocally = useCallback(() => {
        if (userId) {
            localStorage.setItem(`participant_${userId}`, JSON.stringify({
                ...participantProfile,
                photo: profilePicturePreview // Save preview URL for demo
            }));
            alert('Progress saved locally! Complete all mandatory fields to save to backend.');
        }
    }, [userId, participantProfile, profilePicturePreview]);

    // Save to backend
    const saveProfileToBackend = useCallback(async () => {
        if (!userId) return;

        setLoading(true);
        try {
            // Create FormData for file upload
            const formData = new FormData();

            // Add user info
            formData.append('user_id', userId.toString());

            // Add all profile fields
            Object.entries(participantProfile).forEach(([key, value]) => {
                if (key === 'photo' && value instanceof File) {
                    formData.append('photo', value);
                } else if (typeof value === 'boolean') {
                    formData.append(key, value ? 'True' : 'False');
                } else if (value !== null && value !== '') {
                    formData.append(key, value.toString());
                }
            });

            console.log('Sending profile data to backend...');

            // API call to Django backend
            const response = await fetch(`${import.meta.env.VITE_API_URL}/client/profile/add-update`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: formData
            });

            const data = await response.json();
            console.log(data);
            console.log(data.profile);
            console.log(data.profile.id);
            console.log(data.id);

            if (response.ok) {
                alert(data.message || 'Profile saved successfully!');

                // Update completion status
                if (data.profile_completed) {
                    setParticipantProfile(prev => ({
                        ...prev,
                        id: data.profile.id,
                        is_profile_completed: true
                    }));
                    alert('🎉 Profile completed! You can now access all services.');
                }

                // Save to localStorage
                localStorage.setItem(`participant_${userId}`, JSON.stringify({
                    ...participantProfile,
                    photo: profilePicturePreview
                }));
            } else {
                if (data.missing_fields) {
                    alert(`Missing required fields: ${data.missing_fields.join(', ')}`);
                } else {
                    alert(data.error || 'Failed to save profile. Please try again.');
                }
                console.error('API Error:', data);
            }
        } catch (error) {
            console.error('Failed to save profile:', error);
            alert('Failed to save profile. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    }, [userId, participantProfile, profilePicturePreview]);

    return {
        participantProfile,
        profilePicturePreview,
        completionPercentage: completionPercentage(),
        loading,
        handleProfileChange,
        handleProfilePictureChange,
        saveProgressLocally,
        saveProfileToBackend,
        mandatoryFields: MANDATORY_FIELDS
    };
};

export default useProfileManagement;
