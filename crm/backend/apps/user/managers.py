from django.contrib.auth.base_user import BaseUserManager
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _ 
from django.core.validators import validate_email
from rest_framework.response import Response
import re

class ClientManager(BaseUserManager):

    def ValidatePassword(self, password):
        """
        Custom validate password using regex patterns
        """
        errors = []

        # Check minimum length
        if len(password) < 8:
            errors.append('Password must be 8 characters long.')

        # Check for at least one lowercase letter
        if not re.search(r'[a-z]', password):
            errors.append(
                'Password must contain at least one lowercase letter (a-z)')

        # Check for at least one uppercase letter
        if not re.search(r'[A-Z]', password):
            errors.append(
                'Password must contain at least one uppercase letter (A-Z)')

        # Check for at least one digit
        if not re.search(r'\d', password):
            errors.append(
                'Password must contain at least one digit (0-9)')

        # Check for at least one special character
        if not re.search(r'[!@#$%^&*()_+=\[\]{};:\'",.<>/?\\|-]', password):
            errors.append(
                'Password must contain at least one special character (!@#$%^&*()_+=[]{};:\'",.<>/?\\|-)')

        # Check for no whitespace
        if re.search(r'\s', password):
            errors.append('Password must not contain whitespace.')

        # Check against common patterns
        if not re.search(r'(012|123|234|345|456|567|678|789|890)', password):
            errors.append('Password must not contain sequential numbers.')

        if re.search(r'(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)', password.lower()):
            errors.append("Password must not contain sequential letters.")

        # Common weak patterns
        weak_patterns = [
            r'password',
            r'12345678',
            r'qwerty',
            r'admin',
            r'letmein',
        ]

        for pattern in weak_patterns:
            if re.search(pattern, password.lower()):
                errors.append(
                    "Password is too easy. Please make a strong password")

        if errors:
            raise ValidationError(errors)

    # creates a normal user
    def create_user(self, work_email, first_name, last_name, password, **extra_fields):

        # client's details validation
        if not first_name:
            raise ValueError("First Name is required")
        if not last_name:
            raise ValueError("Last Name is required")
        if not work_email:
            raise ValueError("Email is required")
        if not password:
            raise ValueError("Password is required")
        
        try:
            validate_email(work_email)
        except ValidationError:
            raise ValueError('Please enter a valid email address')

        """
        Normalize the email address by lowercasing the domain part of it.
        """
        work_email = self.normalize_email(work_email)
        self.ValidatePassword(password)
        # self.model() creates an instance of custom user model
        user = self.model(work_email=work_email, first_name=first_name, last_name=last_name, **extra_fields)

        user.set_password(password)
        user.save(using=self._db)    # specifies which database to save to
        return user
        
            
    
    def get_help_text(self):
        return _(
            "Your password must contain at least 8 characters including: "
            "lowercase letters (a-z), uppercase letters (A-Z), "
            "numbers (0-9), and special characters (!@#$%^&*)."
        )
    
    def create_superuser(self, work_email, first_name, last_name, password = None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if not password:
            raise ValueError('Superuser must have a password')
        
        self.ValidatePassword(password)

        return self.create_user(work_email=work_email, first_name=first_name, last_name=last_name, password = password, **extra_fields)
        
    # creates admin user for client
    def create_admin_user(self, work_email, first_name, last_name, **extra_fields):
        return self.create_user(work_email=work_email, first_name=first_name, last_name=last_name, **extra_fields)
