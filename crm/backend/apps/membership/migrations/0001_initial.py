# Generated by Django 5.2.3 on 2025-07-12 04:33

import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('company', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='CompanyMembership',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('role', models.CharField(choices=[('CLIENT', 'Client'), ('SUPPORT WORKER', 'Support_worker'), ('ADMIN', 'Admin')], default='STAFF', max_length=30, verbose_name='Role')),
                ('is_active', models.BooleanField(default=False, verbose_name='Is Active')),
                ('joined_at', models.DateTimeField(auto_now_add=True, verbose_name='Joined At')),
                ('left_at', models.DateTimeField(auto_now=True, null=True, verbose_name='Left At')),
                ('company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='memberships', to='company.company')),
            ],
            options={
                'verbose_name': 'Company Membership',
                'verbose_name_plural': 'Company Memberships',
                'db_table': 'company_membership',
            },
        ),
    ]
