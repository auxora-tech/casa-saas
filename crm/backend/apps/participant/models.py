from django.db import models
from django.utils.text import slugify
from django.utils import timezone
from django.contrib.auth import get_user_model
from phonenumber_field.modelfields import PhoneNumberField  # type: ignore

User = get_user_model()


class Participant(models.Model):
    user = models.OneToOneField(
        User, related_name='Participant_Profile', on_delete=models.CASCADE)
    # Basic Info
    slug = models.SlugField(unique=True, blank=True)
    photo = models.ImageField(
        upload_to='media/profile_pictures/', blank=True, null=True)

    # Personal Details
    height = models.DecimalField('Height', blank=True, decimal_places=2, max_digits=5)
    weight = models.DecimalField('Weight', decimal_places=2, blank=True, max_digits=5)
    hair_colour = models.CharField('Hair Colour', max_length=50, blank=True)
    eye_colour = models.CharField('Eye Colour', max_length=50, blank=True)
    spoken_language = models.CharField(
        'Spoken Language', max_length=100, blank=True)
    distinguishing_features = models.TextField(
        'Distinguishing Features', blank=True)
    clothing_size = models.DecimalField(
        'Clothing Size', decimal_places=2, blank=True, max_digits=5)
    shoe_size = models.DecimalField(
        'Shoe Size', max_length=20, blank=True, decimal_places=2, max_digits=5)
    religion_or_culture = models.CharField(
        'Religion or Culture', max_length=100, blank=True)

    # NDIS Info
    ndis_number = models.CharField('NDIS Number', max_length=50, unique=True)
    ndis_plan_start = models.DateField(
        'NDIS Plan Start', blank=False, null=False)
    ndis_plan_end = models.DateField(
        'NDIS Plan End', blank=False, null=False)
    ndis_plan_managed_details = models.TextField(
        'NDIS Plan Managed Details', max_length=300, blank=False, null=False)

    # Cards & Insurance
    pension_type = models.CharField('Pension Type', max_length=50, blank=True)
    pension_number = models.CharField('Pension Number', max_length=50, blank=True)
    pension_expiry = models.DateField('Pension Expiry', blank=True, null=True)

    private_insurance_type = models.CharField('Private Insurance Type', max_length=50, blank=True)
    private_insurance_number = models.CharField('Private Insurance Number', max_length=50, blank=True)
    private_insurance_expiry = models.DateField('Private Insurance Expiry', blank=True, null=True)

    medicare_number = models.CharField('Medicare Number', max_length=50, blank=True)
    medicare_expiry = models.DateField('Medicare Expiry', blank=True, null=True)

    healthcare_card_number = models.CharField('Healthcare Card Number', max_length=50, blank=True)
    healthcare_card_expiry = models.DateField('Healthcare Card Expiry', blank=True, null=True)

    companion_card_number = models.CharField('Companion Card Number', max_length=50, blank=True)
    companion_card_expiry = models.DateField('Companion Card Expiry', blank=True, null=True)

    # Emergency Contacts
    emergency_contact_1 = PhoneNumberField(
        'Emergency Contact 1', blank=False, null=False)
    emergency_contact_2 = PhoneNumberField(
        'Emergency Contact 2', blank=False, null=False)

    # Medical requirements
    name_of_doctor = models.CharField('Doctor Name', blank=True, max_length=50)
    medical_food_other_allergies = models.TextField(
        'Medical, Food or Other Allergies', max_length=500, blank=True)
    medical_condition = models.TextField(
        'Medical Condition', blank=True, max_length=500)
    dietary_requirements = models.TextField(
        'Dietary Requirements', blank=True, max_length=500)

    # About Me
    likes = models.TextField('Likes', blank=True, max_length=300)
    dislikes = models.TextField('Dislikes', blank=True, max_length=300)
    hobbies_interests = models.TextField(
        'Hobbies/Interests', blank=True, max_length=300)
    supports_required = models.TextField(
        'Supports Required', blank=True, max_length=300)
    level_assistance_required = models.TextField(
        'Leve of Assistance Required', blank=True, max_length=300)

    # Specific Needs and Support
    opg_guardian_consent_required = models.BooleanField(
        'OPG/Guardian Consent Required', default=False)
    opg_guardian_consent_required_details = models.TextField(
        'OPG/Guardian Consent Required Details', max_length=500, blank=True)

    public_trustee_or_financial_administrator = models.BooleanField(
        'Public Trustee/Financial Administrator', default=False)
    public_trustee_or_financial_administrator_details = models.TextField(
        'Public Trustee/Financial Administrator Details', max_length=500, blank=True)

    behaviour_management = models.BooleanField(
        'Behaviour Management', default=False)
    behaviour_management_details = models.TextField(
        'Behaviour Management Details', max_length=500, blank=True)

    restrictive_practices = models.BooleanField(
        'Restrictive Practices', default=False)
    restrictive_practices_details = models.TextField(
        'Restrictive Practices Details', max_length=500, blank=True)

    complex_health_support_plan = models.BooleanField(
        'Complex Health Support Plan', default=False)
    complex_health_support_plan_details = models.TextField(
        'Complex Health Support Plan Details', max_length=500, blank=True)

    unsupported_time = models.BooleanField('Unsupported Time', default=False)
    unsupported_time_details = models.TextField(
        'Unsupported Time Details', max_length=300, blank=True)

    mobility = models.BooleanField(
        'Mobility', default=False)
    Mobility_details = models.TextField(
        'Mobility Details', max_length=500, blank=True)

    aids_equipment = models.BooleanField(
        'Aids & Equipment', default=False)
    aids_equipment_details = models.TextField(
        'Aids & Equipment Details', max_length=500, blank=True)

    communication = models.BooleanField(
        'Communication', default=False)
    communication_details = models.TextField(
        'Communication Details', max_length=500, blank=True)

    eating = models.BooleanField(
        'Eating', default=False)
    eating_details = models.TextField(
        'Eating Details', max_length=500, blank=True)

    menstrual_management = models.BooleanField(
        'Menstrual Management', default=False)
    menstrual_management_details = models.TextField(
        'Menstrual Management Details', max_length=500, blank=True)

    toileting = models.BooleanField(
        'Toileting', default=False)
    toileting_details = models.TextField(
        'Toileting Details', max_length=500, blank=True)

    getting_drinks = models.BooleanField(
        'getting_drinks', default=False)
    getting_drinks_details = models.TextField(
        'Getting Drinks Details', max_length=500, blank=True)

    food_preparation = models.BooleanField(
        'Food Preparation', default=False)
    food_preparation_details = models.TextField(
        'Food Preparation Details', max_length=500, blank=True)

    dressing = models.BooleanField(
        'Dressing', default=False)
    dressing_details = models.TextField(
        'Dressing Details', max_length=500, blank=True)

    showering_or_bathing = models.BooleanField(
        'Showering/Bathing', default=False)
    showering_or_bathing_details = models.TextField(
        'Showering/Bathing Details', max_length=500, blank=True)

    medication = models.BooleanField(
        'Medication', default=False)
    medication_details = models.TextField(
        'Medication Details', max_length=500, blank=True)

    friendships_or_relationships = models.BooleanField(
        'Friendships/Relationships', default=False)
    friendships_or_relationships_details = models.TextField(
        'Friendships/Relationships Details', max_length=500, blank=True)

    home_safety_and_security = models.BooleanField(
        'Home Safety & Security', default=False)
    home_safety_and_security_details = models.TextField(
        'Home Safety & Security Details', max_length=500, blank=True)

    community_access = models.BooleanField(
        'Community Access', default=False)
    community_access_details = models.TextField(
        'Community Access Details', max_length=500, blank=True)

    personal_or_road_safety = models.BooleanField(
        'Personal/Road Safety', default=False)
    personal_or_road_safety_details = models.TextField(
        'Personal/Road Safety Details', max_length=500, blank=True)

    transport_or_travel = models.BooleanField(
        'Transport/Travel', default=False)
    transport_or_travel_details = models.TextField(
        'Transport/Travel Details', max_length=500, blank=True)

    chores = models.BooleanField(
        'Chores', default=False)
    chores_details = models.TextField(
        'Chores Details', max_length=500, blank=True)

    hobbies_or_activities = models.BooleanField(
        'Hobbies/Activities', default=False)
    hobbies_or_activities_details = models.TextField(
        'Hobbies/Activities Details', max_length=500, blank=True)

    pet_care = models.BooleanField(
        'Pet Care', default=False)
    pet_care_details = models.TextField(
        'Pet Care Details', max_length=500, blank=True)

    handling_money_or_budgeting = models.BooleanField(
        'Handling Money/Budgeting', default=False)
    handling_money_or_budgeting_details = models.TextField(
        'Handling Money/Budgeting Details', max_length=500, blank=True)

    education_or_employment = models.BooleanField(
        'Education/Employment', default=False)
    education_or_employment_details = models.TextField(
        'Education/Employment Details', max_length=500, blank=True)

    learning_new_skills = models.BooleanField(
        'Learning New Skills', default=False)
    learning_new_skills_details = models.TextField(
        'Learning New Skills Details', max_length=500, blank=True)

    other_needs_and_support = models.BooleanField(
        'Other Needs and Support', default=False)
    other_needs_and_support_details = models.TextField(
        'Other Needs and Support Details', max_length=500, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Confirmation
    is_profile_completed = models.BooleanField('Profile Completed', blank=True, default=False)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.user.first_name}-{self.ndis_number}")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.first_name} ({self.ndis_number})"
