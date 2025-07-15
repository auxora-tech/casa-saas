from django.db import models
from django.utils.text import slugify
from django.utils import timezone
from django.contrib.auth import get_user_model
import uuid 
from . import constant
from phonenumber_field.modelfields import PhoneNumberField  # type: ignore

User = get_user_model()


class Participant(models.Model):
    id = models.AutoField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    user = models.OneToOneField(User, related_name='Participant_Profile', on_delete=models.CASCADE)
    # Basic Info
    preferred_name = models.CharField('Preferred Name', max_length=100, blank=True)
    date_of_birth = models.DateField('Date of Birth', blank=False, null=True)
    address = models.TextField('Address', max_length=500, blank=False, null=False)
    photo = models.ImageField(upload_to='media/profile_pictures/', blank=True, null=True)
    phone = PhoneNumberField(null=False, blank=False, unique=True)

    # Personal Details
    gender = models.CharField('Gender', blank=True, choices=constant.GENDER)
    height = models.DecimalField('Height', blank=True, decimal_places=2, max_digits=5, null=True)
    weight = models.DecimalField('Weight', decimal_places=2, blank=True, max_digits=5, null=True)
    hair_colour = models.CharField('Hair Colour', max_length=50, blank=True, null=True)
    eye_colour = models.CharField('Eye Colour', max_length=50, blank=True, null=True)
    spoken_language = models.CharField(
        'Spoken Language', max_length=100, blank=True, null=True)
    distinguishing_features = models.TextField(
        'Distinguishing Features', blank=True, null=True)
    clothing_size = models.DecimalField(
        'Clothing Size', decimal_places=2, blank=True, max_digits=5, null=True)
    shoe_size = models.DecimalField(
        'Shoe Size', max_length=20, blank=True, decimal_places=2, max_digits=5, null=True)
    religion_or_culture = models.CharField(
        'Religion or Culture', max_length=100, blank=True, null=True)

    # NDIS Info
    ndis_number = models.CharField('NDIS Number', max_length=50, unique=True)
    ndis_plan_start = models.DateField(
        'NDIS Plan Start', blank=False, null=False)
    ndis_plan_end = models.DateField(
        'NDIS Plan End', blank=False, null=False)
    ndis_plan_managed_details = models.TextField(
        'NDIS Plan Managed Details', max_length=300, blank=False, null=False)

    # Cards & Insurance
    pension_type = models.CharField(
        'Pension Type', max_length=50, blank=True, null=True)
    pension_number = models.CharField(
        'Pension Number', max_length=50, blank=True, null=True)
    pension_expiry = models.DateField('Pension Expiry', blank=True, null=True)

    private_insurance_type = models.CharField(
        'Private Insurance Type', max_length=50, blank=True, null=True)
    private_insurance_number = models.CharField(
        'Private Insurance Number', max_length=50, blank=True, null=True)
    private_insurance_expiry = models.DateField('Private Insurance Expiry', blank=True, null=True)

    medicare_number = models.CharField(
        'Medicare Number', max_length=50, blank=True, null=True)
    medicare_expiry = models.DateField('Medicare Expiry', blank=True, null=True)

    healthcare_card_number = models.CharField(
        'Healthcare Card Number', max_length=50, blank=True, null=True)
    healthcare_card_expiry = models.DateField('Healthcare Card Expiry', blank=True, null=True)

    companion_card_number = models.CharField(
        'Companion Card Number', max_length=50, blank=True, null=True)
    companion_card_expiry = models.DateField('Companion Card Expiry', blank=True, null=True)

    # Emergency Contacts
    emergency_contact_1 = PhoneNumberField(
        'Emergency Contact 1', blank=False, null=False)
    emergency_contact_2 = PhoneNumberField(
        'Emergency Contact 2', blank=False, null=False)
    guardian_name = models.CharField('Guardian Name', blank=False, null=False, max_length=30, default='John Doe')
    guardian_address = models.TextField('Guardian Address', blank=False, null=False, max_length=100, default='Australia')
    guardian_contact = PhoneNumberField('Guardian Contact', blank=False, null=False, default='458493')
    guardian_email = models.EmailField('Guardian Email', blank=False, null=False, default='john_doe@gmail.com')


    # Medical requirements
    name_of_doctor = models.CharField(
        'Doctor Name', blank=True, max_length=50, null=True)
    medical_food_other_allergies = models.TextField(
        'Medical, Food or Other Allergies', max_length=500, blank=True, null=True)
    medical_condition = models.TextField(
        'Medical Condition', blank=True, max_length=500, null=True)
    dietary_requirements = models.TextField(
        'Dietary Requirements', blank=True, max_length=500, null=True)

    # About Me
    likes = models.TextField('Likes', blank=True, max_length=300, null=True)
    dislikes = models.TextField(
        'Dislikes', blank=True, max_length=300, null=True)
    hobbies_interests = models.TextField(
        'Hobbies/Interests', blank=True, max_length=300, null=True)
    supports_required = models.TextField(
        'Supports Required', blank=True, max_length=300, null=True)
    level_assistance_required = models.TextField(
        'Leve of Assistance Required', blank=True, max_length=300, null=True)

    # Specific Needs and Support
    opg_guardian_consent_required = models.BooleanField(
        'OPG/Guardian Consent Required', default=False)
    opg_guardian_consent_required_details = models.TextField(
        'OPG/Guardian Consent Required Details', max_length=500, blank=True, null=True)

    public_trustee_or_financial_administrator = models.BooleanField(
        'Public Trustee/Financial Administrator', default=False)
    public_trustee_or_financial_administrator_details = models.TextField(
        'Public Trustee/Financial Administrator Details', max_length=500, blank=True, null=True)

    behaviour_management = models.BooleanField(
        'Behaviour Management', default=False)
    behaviour_management_details = models.TextField(
        'Behaviour Management Details', max_length=500, blank=True, null=True)

    restrictive_practices = models.BooleanField(
        'Restrictive Practices', default=False)
    restrictive_practices_details = models.TextField(
        'Restrictive Practices Details', max_length=500, blank=True, null=True)

    complex_health_support_plan = models.BooleanField(
        'Complex Health Support Plan', default=False)
    complex_health_support_plan_details = models.TextField(
        'Complex Health Support Plan Details', max_length=500, blank=True, null=True)

    unsupported_time = models.BooleanField('Unsupported Time', default=False)
    unsupported_time_details = models.TextField(
        'Unsupported Time Details', max_length=300, blank=True, null=True)

    mobility = models.BooleanField(
        'Mobility', default=False)
    Mobility_details = models.TextField(
        'Mobility Details', max_length=500, blank=True, null=True)

    aids_equipment = models.BooleanField(
        'Aids & Equipment', default=False)
    aids_equipment_details = models.TextField(
        'Aids & Equipment Details', max_length=500, blank=True, null=True)

    communication = models.BooleanField(
        'Communication', default=False)
    communication_details = models.TextField(
        'Communication Details', max_length=500, blank=True, null=True)

    eating = models.BooleanField(
        'Eating', default=False)
    eating_details = models.TextField(
        'Eating Details', max_length=500, blank=True, null=True)

    menstrual_management = models.BooleanField(
        'Menstrual Management', default=False)
    menstrual_management_details = models.TextField(
        'Menstrual Management Details', max_length=500, blank=True, null=True)

    toileting = models.BooleanField(
        'Toileting', default=False)
    toileting_details = models.TextField(
        'Toileting Details', max_length=500, blank=True, null=True)

    getting_drinks = models.BooleanField(
        'getting_drinks', default=False)
    getting_drinks_details = models.TextField(
        'Getting Drinks Details', max_length=500, blank=True, null=True)

    food_preparation = models.BooleanField(
        'Food Preparation', default=False)
    food_preparation_details = models.TextField(
        'Food Preparation Details', max_length=500, blank=True, null=True)

    dressing = models.BooleanField(
        'Dressing', default=False)
    dressing_details = models.TextField(
        'Dressing Details', max_length=500, blank=True, null=True)

    showering_or_bathing = models.BooleanField(
        'Showering/Bathing', default=False)
    showering_or_bathing_details = models.TextField(
        'Showering/Bathing Details', max_length=500, blank=True, null=True)

    medication = models.BooleanField(
        'Medication', default=False)
    medication_details = models.TextField(
        'Medication Details', max_length=500, blank=True, null=True)

    friendships_or_relationships = models.BooleanField(
        'Friendships/Relationships', default=False)
    friendships_or_relationships_details = models.TextField(
        'Friendships/Relationships Details', max_length=500, blank=True, null=True)

    home_safety_and_security = models.BooleanField(
        'Home Safety & Security', default=False)
    home_safety_and_security_details = models.TextField(
        'Home Safety & Security Details', max_length=500, blank=True, null=True)

    community_access = models.BooleanField(
        'Community Access', default=False)
    community_access_details = models.TextField(
        'Community Access Details', max_length=500, blank=True, null=True)

    personal_or_road_safety = models.BooleanField(
        'Personal/Road Safety', default=False)
    personal_or_road_safety_details = models.TextField(
        'Personal/Road Safety Details', max_length=500, blank=True, null=True)

    transport_or_travel = models.BooleanField(
        'Transport/Travel', default=False)
    transport_or_travel_details = models.TextField(
        'Transport/Travel Details', max_length=500, blank=True, null=True)

    chores = models.BooleanField(
        'Chores', default=False)
    chores_details = models.TextField(
        'Chores Details', max_length=500, blank=True, null=True)

    hobbies_or_activities = models.BooleanField(
        'Hobbies/Activities', default=False)
    hobbies_or_activities_details = models.TextField(
        'Hobbies/Activities Details', max_length=500, blank=True, null=True)

    pet_care = models.BooleanField(
        'Pet Care', default=False)
    pet_care_details = models.TextField(
        'Pet Care Details', max_length=500, blank=True, null=True)

    handling_money_or_budgeting = models.BooleanField(
        'Handling Money/Budgeting', default=False)
    handling_money_or_budgeting_details = models.TextField(
        'Handling Money/Budgeting Details', max_length=500, blank=True, null=True)

    education_or_employment = models.BooleanField(
        'Education/Employment', default=False)
    education_or_employment_details = models.TextField(
        'Education/Employment Details', max_length=500, blank=True, null=True)

    learning_new_skills = models.BooleanField(
        'Learning New Skills', default=False)
    learning_new_skills_details = models.TextField(
        'Learning New Skills Details', max_length=500, blank=True, null=True)

    other_needs_and_support = models.BooleanField(
        'Other Needs and Support', default=False)
    other_needs_and_support_details = models.TextField(
        'Other Needs and Support Details', max_length=500, blank=True, null=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Confirmation
    is_profile_completed = models.BooleanField('Profile Completed', blank=True, default=False)

    class Meta:
        ordering = ['-created_at']

    # def save(self, *args, **kwargs):
    #     if not self.slug:
    #         self.slug = slugify(f"{self.user.first_name}-{self.ndis_number}")
    #     super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.first_name} ({self.ndis_number})"
