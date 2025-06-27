from django.db import models
from django.utils import timezone
from phonenumber_field.modelfields import PhoneNumberField
from . constant import SUBSCRIPTION_PLAN
from . constant import EMPLOYEE_RANGES
from .constant import COUNTRIES
from . constant import COMPANY_CATEGORIES

# Create your models here.


class Company(models.Model):

    title = models.CharField('Title', blank=False,
                             null=False, unique=True, max_length=100)
    category = models.CharField(
        'Category', blank=False, null=False, max_length=50, choices=COMPANY_CATEGORIES)
    no_of_employees = models.CharField(
        'Number of Employees', null=False, blank=False, choices=EMPLOYEE_RANGES)
    country = models.CharField(
        'Country', max_length=50, choices=COUNTRIES, blank=False, null=False)
    is_active = models.BooleanField('Is Active', default=True)

    website = models.URLField('Website', blank=True, null=True)
    phone = PhoneNumberField('Phone', blank=True, null=True)
    address = models.TextField('Address', blank=False, null=False)

    # subscription fields
    subscription_plan = models.CharField(
        'Plan', max_length=20, default='FREE', choices=SUBSCRIPTION_PLAN)
    subscription_expires = models.DateTimeField(
        'Subscription Expires', null=True, blank=True)

    # timestamp
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'company'
        verbose_name = 'Company'
        verbose_name_plural = 'Companies'
        ordering = ['title']

    @property
    def is_subscription_active(self):
        # check if there is any subscription
        if self.subscription_expires:
            # return False if subscription has been expired
            return timezone.now() < self.subscription_expires
        # FREE subscription has no time limit
        return self.subscription_plan == 'FREE'

    def get_active_admins(self):
        """
        Get all active admins of a company
        """
        from apps.membership.models import CompanyMembership
        return CompanyMembership.objects.filter(
            company=self,
            role='ADMIN',
            is_active=True
        ).select_related('user')

    def get_all_active_members(self):
        """
        Get all active users/members of a company
        """
        from apps.membership.models import CompanyMembership
        return CompanyMembership.objects.filter(
            company=self,
            is_active=True
        ).select_related('user')

    def __str__(self):
        return self.title
