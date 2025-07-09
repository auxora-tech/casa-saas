from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q 

# Q allows you to create complex database queries with OR, AND, and NOT logic, which you can't easily do with regular Django ORM filters.

User = get_user_model()

class EmailAuthBackend(ModelBackend):
    """
    Custom authentication backend that authenticates users by work_email
    """
    def authenticate(self, request, username = None, password = None, **kwargs):
        if username is None:
            username = kwargs.get('work_email')
        
        if username is None or password is None:
            return None 
        
        try:
            user = User.objects.get(
                Q(work_email__iexact = username)
            )
            if user.check_password(password) and self.user_can_authenticate(user):
                return user
            
        except User.DoesNotExist:
            User().set_password(password)
            return None
    
        return None
    
    def user_can_authenticate(self, user):
        """
        check if user can authenticate (is_active = True)
        """
        is_active = getattr(user, 'is_active', None)
        return is_active or is_active is None 
    
    def get_user(self, user_id):
        try:
            return User.objects.get(pk = user_id)
        except User.DoesNotExist:
            return None 
