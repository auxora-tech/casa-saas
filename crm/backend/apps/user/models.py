from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from phonenumber_field.modelfields import PhoneNumberField
from . managers import ClientManager
from django.utils import timezone

# Create your models here.


class User_Model(AbstractBaseUser, PermissionsMixin):

    first_name = models.CharField(
        'First Name', max_length=30, blank=False, null=False)
    last_name = models.CharField(
        'Last Name', max_length=30, blank=False, null=False)
    work_email = models.EmailField(
        'Work Email', blank=False, null=False, unique=True)
    phone = PhoneNumberField(null=False, blank=False, unique=True)

    # Required fields for AbstractBaseUser
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    # Timestamp
    date_joined = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'work_email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'phone']

    objects = ClientManager()  # custom manager

    class Meta:
        db_table = 'custom_user'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def get_companies(self):
        """
        Get all companies associated with a user
        """
        from apps.membership.models import CompanyMembership
        return CompanyMembership.objects.filter(
            user=self,
            is_active=True,
            # prevents N+1 queries. Only used with Foreign Key or OneToOne relationship
        ).select_related('company')

    def get_role_in_company(self, company):
        """Get user's role in a specific company"""
        from apps.membership.models import CompanyMembership
        try:
            membership = CompanyMembership.objects.get(
                user=self,
                company=company,
                is_active=True
            )
            return membership.role
        except CompanyMembership.DoesNotExist:
            return None

    def is_admin_of_company(self, company):
        """Check if this user is admin of the given company"""
        return self.get_role_in_company(company) == 'ADMIN'

    def __str__(self):
        return f"{self.first_name} {self.last_name} {self.work_email}"
