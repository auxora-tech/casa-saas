from django.db import models
# from django.contrib.auth import get_user_model
from apps.participant.models import Participant
import uuid


class ServiceAgreement(models.Model):
    """
    Database table to track service agreements
    Each row = one client's agreement
    """

    # Which client this agreement belongs to
    participant = models.ForeignKey(Participant, on_delete=models.CASCADE)

    # Agreement status
    status = models.CharField(max_length=30, choices=[
        ('NOT_STARTED', 'Not Started'),      # Just created, no PandaDoc yet
        ('SENT_FOR_SIGNATURE', 'Sent'),      # PandaDoc sent to client
        ('SIGNED', 'Signed'),                # Client signed it
        ('DECLINED', 'Declined'),            # Client declined
    ])

    # PandaDoc info
    pandadoc_document_id = models.CharField(max_length=100, blank=True)
    pandadoc_signing_url = models.URLField(blank=True)

    # Client info
    client_name = models.CharField(max_length=200)
    ndis_number = models.CharField(max_length=50)

    # When things happened
    created_at = models.DateTimeField(auto_now_add=True)
    signed_at = models.DateTimeField(null=True, blank=True)
