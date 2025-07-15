from django.db import models
# from django.contrib.auth import get_user_model
from apps.participant.models import Participant
import uuid
from . import constant


class ServiceAgreement(models.Model):
    participant = models.ForeignKey(Participant, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=[
        ('NOT_STARTED', 'Not Started'),
        ('PENDING_SIGNATURE', 'Pending Signature'),
        ('SIGNED', 'Signed'),
        ('COMPLETED', 'Completed')
    ], default='NOT_STARTED')
    zoho_request_id = models.CharField(max_length=100, blank=True)
    signed_date = models.DateTimeField(null=True, blank=True)
    document_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    casa_rep_name = models.CharField('Owner', blank=False, null=False, default = 'Anju Isenth')
    # Individual signer dates
    casa_rep_signature_date = models.DateTimeField('Owner Signed Date',null=True, blank=True)
    client_signature_date = models.DateTimeField('Client Signed Date', null=True, blank=True)
    guardian_signature_date = models.DateTimeField('Guardian Signed Date', null=True, blank=True)
    client_additional_comments = models.TextField('Client Additional Comments', null=True, blank=True, max_length=500)
    owner_additional_comments = models.TextField('Owner Additional Comments', blank=True, null=True, max_length=500)
    informed_refusal_consent = models.TextField('Informed Refusal Consent', blank=True, null=True)
    client_other_info = models.TextField('Client Other Info', blank=True, null=True, max_length=500)

    # Authorisation Consent
    can_participate_in_water = models.TextField('Participate in Water Based Activities', blank=True, null=True, max_length=100)
    safe_participate_in_water = models.TextField('Safe to Participate in Water Based Activities', blank=True, null=True, max_length=100)
    casa_staff_provide_water_activity = models.TextField('Casa Staff Provide Water Based Activity', blank=True, null=True, max_length=100)
    casa_staff_call_emergency_service = models.TextField('Casa Staff Call Emergency Service', blank=True, null=True, max_length=100)
    casa_staff_share_information = models.TextField('Casa Staff Share Information', blank=True, null=True, max_length=100)

    # Skill Level Information
    like_water = models.CharField('Like Water', blank=True, null=True, choices=constant.YES_NO)
    able_swim = models.CharField('Able to Swim', blank=True, null=True, choices=constant.YES_NO)
    safe_water = models.CharField('Safe Water', blank=True, null=True, choices=constant.YES_NO)
    tire_easily = models.CharField('Tire Easily', blank=True, null=True, choices=constant.YES_NO)
    swimming_skill_level = models.CharField('Swimming Skill Level', blank=True, null=True, choices=constant.SKILLS)
    energy_level = models.CharField('Energy Level', blank=True, null=True, choices=constant.SKILLS)
    two_more_staff = models.CharField('Two More Staff', blank=True, null=True, choices=constant.YES_NO)
    current_complex_health_support_plan = models.TextField('Current Complex Health Support Plan', blank=True, null=True, max_length=200)

    # Schedule of support
    day_time_frequency = models.TextField('Day/Time Frequency', blank=True, null=True, max_length=500)
    support_ratio = models.TextField('Support Ratio', blank=True, null=True, max_length=500)
    description = models.TextField('Description', blank=True, null=True, max_length=500)
