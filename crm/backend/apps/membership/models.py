from django.db import models
from apps.company.models import Company
from apps.user.models import User_Model
from . constant import ROLES

# Create your models here.


class CompanyMembership(models.Model):

    user = models.ForeignKey(
        User_Model, on_delete=models.CASCADE, related_name='memberships')
    company = models.ForeignKey(
        Company, on_delete=models.CASCADE, related_name='memberships')
    role = models.CharField('Role', default='STAFF',
                            choices=ROLES, max_length=30)
    is_active = models.BooleanField('Is Active', default=True)
    joined_at = models.DateTimeField('Joined At', auto_now_add=True)
    left_at = models.DateTimeField(
        'Left At', auto_now=True, null=True, blank=True)

    class Meta:
        unique_together = ['user', 'company']
        db_table = 'company_membership'
        verbose_name = 'Company Membership'
        verbose_name_plural = 'Company Memberships'

    def __str__(self):
        return f"{self.user.first_name} {self.company.title} {self.role}"
