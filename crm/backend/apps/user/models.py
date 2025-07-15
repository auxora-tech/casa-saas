from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from phonenumber_field.modelfields import PhoneNumberField # type: ignore
from . managers import ClientManager
from django.utils import timezone
import uuid

# Create your models here.


class User_Model(AbstractBaseUser, PermissionsMixin):

    id = models.AutoField(primary_key=True)

    #A UUID(Universally Unique Identifier) is a 128-bit number used to uniquely identify objects across space and time.
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    first_name = models.CharField('First Name', max_length=30, blank=False, null=False)
    last_name = models.CharField('Last Name', max_length=30, blank=False, null=False)
    work_email = models.EmailField('Work Email', blank=False, null=False, unique=True)
    # slug = models.SlugField(blank=True, null=True)
    email_verified = models.BooleanField('Email Verified', default=False)

    # Required fields for AbstractBaseUser
    is_active = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    # Timestamp
    date_joined = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'work_email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    objects = ClientManager()  # custom manager

    class Meta:
        db_table = 'custom_user'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"

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

class LoginAttempt(models.Model):
    """Simple login attempt tracking"""
    email = models.EmailField()
    ip_address = models.GenericIPAddressField()
    success = models.BooleanField()
    attempt_type = models.CharField(max_length=30, default = 'magic_link')
    created_at = models.DateTimeField(auto_now_add=True) 

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.email} - {'Success' if self.success else 'Failed'}"
    

class UserSession(models.Model):
    """Basic user session tracking"""
    user = models.ForeignKey(User_Model, on_delete=models.CASCADE, related_name='sessions')
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.work_email} - {self.created_at}"
    

class AuditLog(models.Model):
    """Simple audit logging"""
    user = models.ForeignKey(User_Model, on_delete=models.SET_NULL, null=True)
    user_email = models.EmailField()
    action = models.CharField(max_length=100)
    description = models.TextField()
    ip_address = models.GenericIPAddressField()
    created_at = models.DateTimeField(auto_now_add=True)

    @classmethod
    def log_action(cls, user, action, description, request = None):
        """Helper to log actions"""
        ip_address = '127.0.0.1'
        if request:
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip_address = x_forwarded_for.split(',')[0].strip()
            else:
                ip_address = request.META.get('REMOTE_ADDR', '127.0.0.1')

        return cls.objects.create(
            user = user,
            user_email = user.work_email if user else 'system',
            action = action,
            description = description,
            ip_address = ip_address
        )
    
    def __str__(self):
        return f"{self.user_email} - {self.action}"
