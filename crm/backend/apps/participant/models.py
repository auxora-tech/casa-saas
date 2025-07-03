from django.db import models
from django.utils.text import slugify
from django.utils import timezone
from django.contrib.auth import get_user_model
from phonenumber_field.modelfields import PhoneNumberField  # type: ignore
from . constant import GENDER

User = get_user_model()


class Participant(models.Model):
    user = models.OneToOneField(User, related_name='participant-profile', on_delete=models.CASCADE)
    # Basic Info
    preferred_name = models.CharField('Preferred Name', max_length=100, blank=True)
    date_of_birth = models.DateField('Date of Birth', blank=False, null=False, required = True)
    slug = models.SlugField(unique=True, blank=True)

    address = models.TextField('Address', max_length=500, blank=False, null=False, required = True)
    contact_number = PhoneNumberField(blank = False, null= False, unique = True, required = True)
    photo = models.ImageField(
        upload_to='participant_photos/', blank=True, null=True)

    # Personal Details
    gender = models.CharField('Gender', max_length=20, blank=True, choices=GENDER)
    height = models.DecimalField('Height', blank=True, decimal_places=2)
    weight = models.DecimalField('Weight', decimal_places=2, blank=True)
    hair_colour = models.CharField('Hair Colour', max_length=50, blank=True)
    eye_colour = models.CharField('Eye Colour', max_length=50, blank=True)
    spoken_language = models.CharField('Spoken Language', max_length=100, blank=True)
    distinguishing_features = models.TextField('Distinguishing Features', blank=True)
    clothing_size = models.DecimalField('Clothing Size', decimal_places=2, blank=True)
    shoe_size = models.DecimalField('Shoe Size', max_length=20, blank=True, decimal_places=2)
    religion_or_culture = models.CharField('Religion or Culture', max_length=100, blank=True)

    # NDIS Info
    ndis_number = models.CharField('NDIS Number', max_length=50, unique=True)
    ndis_plan_start = models.DateField('NDIS Plan Start', blank=False, null=False, required = True)
    ndis_plan_end = models.DateField('NDIS Plan End', blank=False, null=False, required = True)
    ndis_plan_managed_details = models.TextField(max_length=300, blank=False, null=False, required = True)

    # Cards & Insurance
    pension_type = models.CharField(max_length=50, blank=True)
    pension_number = models.CharField(max_length=50, blank=True)
    pension_expiry = models.DateField(blank=True, null=True)

    private_insurance_type = models.CharField(max_length=50, blank=True)
    private_insurance_number = models.CharField(max_length=50, blank=True)
    private_insurance_expiry = models.DateField(blank=True, null=True)

    medicare_number = models.CharField(max_length=50, blank=True)
    medicare_expiry = models.DateField(blank=True, null=True)

    healthcare_card_number = models.CharField(max_length=50, blank=True)
    healthcare_card_expiry = models.DateField(blank=True, null=True)

    companion_card_number = models.CharField(max_length=50, blank=True)
    companion_card_expiry = models.DateField(blank=True, null=True)

    # Emergency Contacts
    emergency_contact_1 = PhoneNumberField('Emergency Contact 1', blank = False, null= False, required = True)
    emergency_contact_2 = PhoneNumberField('Emergency Contact 2', blank=False, null=False, required = True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Confirmation
    is_completed = models.BooleanField('Is Completed', blank=True, default=False)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.full_name}-{self.ndis_number}")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.full_name} ({self.ndis_number})"
