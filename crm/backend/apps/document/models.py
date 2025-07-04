from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

# Create your models here.
class Document(models.Model):
    id = models.AutoField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='documents')
    title = models.CharField('Title', blank=False, null=False, max_length=100)
    file = models.FileField('File', upload_to='media/documents')
    # auto_now_add sets the field to the current date and time only when the object is first created
    uploaded_at = models.DateTimeField('Uploaded At', auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.user.work_email}"
