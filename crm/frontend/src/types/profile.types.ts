// types/profile.types.ts
export interface ParticipantProfile {
    // Basic Info (MANDATORY)
    id: null;
    preferred_name: string;
    date_of_birth: string;
    address: string;
    phone: string;
    photo: File | string | null;

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

    // Emergency Contacts & Guardian (MANDATORY)
    emergency_contact_1: string;
    emergency_contact_2: string;
    guardian_name: string;
    guardian_address: string;
    guardian_contact: string;

    // Medical Requirements (OPTIONAL)
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

    // Support Needs - Boolean fields (OPTIONAL)
    opg_guardian_consent_required: boolean;
    opg_guardian_consent_required_details: string;
    public_trustee_or_financial_administrator: boolean;
    public_trustee_or_financial_administrator_details: string;
    behaviour_management: boolean;
    behaviour_management_details: string;
    restrictive_practices: boolean;
    restrictive_practices_details: string;
    complex_health_support_plan: boolean;
    complex_health_support_plan_details: string;
    unsupported_time: boolean;
    unsupported_time_details: string;
    mobility: boolean;
    mobility_details: string;
    aids_equipment: boolean;
    aids_equipment_details: string;
    communication: boolean;
    communication_details: string;
    eating: boolean;
    eating_details: string;
    menstrual_management: boolean;
    menstrual_management_details: string;
    toileting: boolean;
    toileting_details: string;
    getting_drinks: boolean;
    getting_drinks_details: string;
    food_preparation: boolean;
    food_preparation_details: string;
    dressing: boolean;
    dressing_details: string;
    showering_or_bathing: boolean;
    showering_or_bathing_details: string;
    medication: boolean;
    medication_details: string;
    friendships_or_relationships: boolean;
    friendships_or_relationships_details: string;
    home_safety_and_security: boolean;
    home_safety_and_security_details: string;
    community_access: boolean;
    community_access_details: string;
    personal_or_road_safety: boolean;
    personal_or_road_safety_details: string;
    transport_or_travel: boolean;
    transport_or_travel_details: string;
    chores: boolean;
    chores_details: string;
    hobbies_or_activities: boolean;
    hobbies_or_activities_details: string;
    pet_care: boolean;
    pet_care_details: string;
    handling_money_or_budgeting: boolean;
    handling_money_or_budgeting_details: string;
    education_or_employment: boolean;
    education_or_employment_details: string;
    learning_new_skills: boolean;
    learning_new_skills_details: string;
    other_needs_and_support: boolean;
    other_needs_and_support_details: string;

    // Profile Status
    is_profile_completed: boolean;
}

export interface ProfileStep {
    id: string;
    label: string;
    icon: any;
    description: string;
    required: boolean;
}

export interface ProfileFormProps {
    profile: ParticipantProfile;
    onUpdate: (field: string, value: string | boolean | File) => void;
    onSave?: () => void;
    loading?: boolean;
}

export interface SupportNeedItem {
    field: string;
    label: string;
    description?: string;
    category: string;
}
