from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()
# Create your models here.
class OnboardingStatus(models.Model):
    id = models.AutoField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    is_profile_completed = models.BooleanField('Profile Completed', default=False)
    is_document_uploaded = models.BooleanField('Document Uploaded', default=False)
    completed_at = models.DateTimeField('Completed At', blank=True, null=True, auto_now=True)

    def __str__(self):
        return f'Onboarding for {self.user.first_name} - {self.user.work_email} - {self.completed_at}'
