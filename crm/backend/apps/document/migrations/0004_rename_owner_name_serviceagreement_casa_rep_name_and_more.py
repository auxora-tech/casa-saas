# Generated by Django 5.2.3 on 2025-07-13 07:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('document', '0003_serviceagreement_able_swim_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='serviceagreement',
            old_name='owner_name',
            new_name='casa_rep_name',
        ),
        migrations.RenameField(
            model_name='serviceagreement',
            old_name='owner_signed_date',
            new_name='casa_rep_signature_date',
        ),
        migrations.RenameField(
            model_name='serviceagreement',
            old_name='client_signed_date',
            new_name='client_signature_date',
        ),
        migrations.RenameField(
            model_name='serviceagreement',
            old_name='guardian_signed_date',
            new_name='guardian_signature_date',
        ),
        migrations.AddField(
            model_name='serviceagreement',
            name='client_other_info',
            field=models.TextField(blank=True, max_length=500, null=True, verbose_name='Client Other Info'),
        ),
    ]
