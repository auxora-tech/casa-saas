from django.db import models
from django.contrib.auth import get_user_model
from phonenumber_field.modelfields import PhoneNumberField  # type: ignore

User = get_user_model()

# Create your models here.


class Employee(models.Model):

    user = models.OneToOneField(
        User, related_name='Employee_Profile', on_delete=models.CASCADE)
    tfn = models.CharField('TFN', blank=False, null=False, unique=True)

    # Superannuation details
    fund_name = models.CharField(
        'Fund Name', max_length=50, blank=True, null=True)
    abn = models.CharField('ABN', max_length=12, blank=True, null=True)
    member_number = models.IntegerField(
        'Number of Members', blank=True, null=True)

    # 100 point id
    # Salary Bank Details

    bank_name = models.CharField(
        'Bank Name', max_length=100, blank=False, null=False)
    account_name = models.CharField(
        'Account Name', max_length=50, blank=False, null=False)
    bsb = models.CharField('BSB', max_length=6, blank=False,
                           null=False, unique=True)
    account_number = models.CharField(
        'Account Number', blank=False, null=False, unique=True, max_length=10)

    # contact details
    emergency_contact_first_name = models.CharField(
        'Emergency Contact First Name', max_length=20, blank=False, null=False)
    emergency_contact_last_name = models.CharField(
        'Emergency Contact Last Name', max_length=20, blank=True, null=True)
    emergency_contact_number = PhoneNumberField(
        'Emergency Contact Number', blank=False, null=False)
    emergency_contact_home = PhoneNumberField(
        'Emergency Contact Home', blank=True, null=True)
    emergency_contact_relationship = models.CharField(
        'Emergency Contact Relationship', blank=False, null=False, max_length=20)
