from django.db import models
from django.contrib.auth import get_user_model
import uuid 
from . import constant
from phonenumber_field.modelfields import PhoneNumberField  # type: ignore

User = get_user_model()

# Create your models here.


class Employee(models.Model):

    id = models.AutoField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    user = models.OneToOneField(User, related_name='Employee_Profile', on_delete=models.CASCADE)
    date_of_birth = models.DateField('Date of Birth', blank=False, null=True)
    address = models.TextField('Address', max_length=500, blank=False, null=False)
    phone = PhoneNumberField(null=False, blank=False, unique=True)
    suburb = models.CharField('Suburb', max_length=100,blank=True, choices=constant.AUSTRALIAN_SUBURBS)
    state_territory = models.CharField('State or Territory', max_length=3, blank=True, choices=constant.AUSTRALIAN_STATES_AND_TERRITORIES)
    postcode = models.CharField('Postcode', max_length=4, blank=True)
    tfn = models.CharField('TFN', blank=False, null=False, unique=True)

    # Superannuation details
    fund_name = models.CharField('Fund Name', max_length=50, blank=True, null=True)
    abn = models.CharField('ABN', max_length=12, blank=True, null=True)
    member_number = models.IntegerField('Number of Members', blank=True, null=True)

    # 100 point id
    # Salary Bank Details

    bank_name = models.CharField('Bank Name', max_length=100, blank=False, null=False)
    account_name = models.CharField('Account Name', max_length=50, blank=False, null=False)
    bsb = models.CharField('BSB', max_length=6, blank=False,null=False, unique=True)
    account_number = models.CharField('Account Number', blank=False, null=False, unique=True, max_length=10)

    # contact details
    emergency_contact_first_name = models.CharField('Emergency Contact First Name', max_length=20, blank=False, null=False)
    emergency_contact_last_name = models.CharField('Emergency Contact Last Name', max_length=20, blank=True, null=True)
    emergency_contact_number = PhoneNumberField('Emergency Contact Number', blank=False, null=False)
    emergency_contact_home = PhoneNumberField('Emergency Contact Home', blank=True, null=True)
    emergency_contact_relationship = models.CharField('Emergency Contact Relationship', blank=False, null=False, max_length=20)
