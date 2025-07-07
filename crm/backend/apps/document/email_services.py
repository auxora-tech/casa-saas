# ==========================================
# EMAIL NOTIFICATION SYSTEM FOR PROFILE COMPLETION
# ==========================================

# from apps.notifications.email_service import EmailService
from django.core.mail import send_mail, EmailMultiAlternatives
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status 
from rest_framework.response import Response
from . models import ServiceAgreement
from apps.participant.models import Participant
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone
from django.db import transaction

# ==========================================
# EMAIL SERVICE CLASS
# ==========================================

class EmailService:
    """Handle all email notifications"""

    # @staticmethod is a Python decorator that makes a method belong to the class, but doesn't need an instance of the class to work.
    @staticmethod
    def send_profile_completion_notification(participant):
        """
        Send email notification when client completes profile
        """
        try:
            # Email subject
            subject = f'📋 New Client Profile Completed - {participant.user.first_name} {participant.user.last_name}'

            # Email content
            message = f"""
            🎉 NEW CLIENT PROFILE COMPLETED

            Client Details:
            • Name: {participant.user.first_name} {participant.user.last_name}
            • Email: {participant.user.work_email}
            • Phone: {participant.phone}
            • NDIS Number: {participant.ndis_number}
            • Address: {participant.address}
            • Plan Period: {participant.ndis_plan_start} to {participant.ndis_plan_end}
            • Profile Completed: {participant.updated_at.strftime('%d/%m/%Y at %I:%M %p')}

            NEXT STEPS:
            1. Create service agreement in PandaDoc using your template
            2. Fill in client details from above
            3. Send agreement to: {participant.user.work_email}
            4. Client will sign and system will auto-update

            CLIENT DASHBOARD: 
            Your client can track progress at: https://your-domain.com/client/dashboard/

            ---
            Casa Community CRM System
                        """

            # Send email to all admin addresses
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=settings.NOTIFICATION_EMAILS,
                fail_silently=False,
            )
            return True

        except Exception as e:
            print(e)
            return False

    # ==========================================
    # UPDATED WEBHOOK FOR PANDADOC COMPLETION
    # ==========================================


    @api_view(['POST'])
    @permission_classes([])
    def pandadoc_webhook_with_notification(request):
        """
        Enhanced webhook that also sends completion notification
        """

        try:
            webhook_data = request.data
            event_type = webhook_data.get('event_type')
            document_data = webhook_data.get('data', {})
            document_id = document_data.get('id')

            if not document_id:
                return Response({'error': 'No document ID'}, status=400)

            # Find agreement by PandaDoc document ID
            try:
                agreement = ServiceAgreement.objects.get(
                    pandadoc_document_id=document_id)
            except ServiceAgreement.DoesNotExist:
                return Response({'status': 'ignored - document not in system'})

            # Update status based on webhook event
            if event_type == 'document.completed':
                from django.utils import timezone
                agreement.status = 'SIGNED'
                agreement.signed_at = timezone.now()
                agreement.save()

                # Send completion notification to admin
                EmailService.send_agreement_completed_notification(agreement)

                # logger.info(f"Agreement signed by {agreement.client_name}")

            elif event_type == 'document.declined':
                agreement.status = 'DECLINED'
                agreement.save()

                # Send declined notification to admin
                EmailService.send_agreement_declined_notification(agreement)

            return Response({'status': 'success'})

        except Exception as e:
            # logger.error(f"Webhook error: {str(e)}")
            return Response({'error': 'Processing failed'}, status=500)

    # ==========================================
    # ADDITIONAL EMAIL NOTIFICATIONS
    # ==========================================

    # Add these methods to EmailService class


    def send_agreement_completed_notification(agreement):
        """Send notification when client signs agreement"""
        try:
            subject = f'✅ Service Agreement Signed - {agreement.client_name}'

            message = f"""
    🎉 SERVICE AGREEMENT COMPLETED!

    Client: {agreement.client_name}
    NDIS Number: {agreement.ndis_number}
    Signed: {agreement.signed_at.strftime('%d/%m/%Y at %I:%M %p')}

    STATUS: Onboarding Complete ✅

    The client's dashboard now shows "Welcome to Casa Community!"
    You can now:
    • Schedule their first support session
    • Assign support workers
    • Begin service delivery

    Client Dashboard: https://your-domain.com/client/dashboard/

    ---
    Casa Community CRM System
            """

            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=settings.NOTIFICATION_EMAILS,
                fail_silently=False,
            )

            return True

        except Exception as e:
            # logger.error(f"Failed to send agreement completion email: {str(e)}")
            return False


    def send_agreement_declined_notification(agreement):
        """Send notification when client declines agreement"""
        try:
            subject = f'❌ Service Agreement Declined - {agreement.client_name}'

            message = f"""
    ⚠️ SERVICE AGREEMENT DECLINED

    Client: {agreement.client_name}
    NDIS Number: {agreement.ndis_number}
    Email: {agreement.participant.work_email}

    ACTION REQUIRED:
    • Contact client to discuss concerns
    • Review agreement terms
    • Send revised agreement if needed

    Client Contact: {agreement.participant.work_email}

    ---
    Casa Community CRM System
            """

            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=settings.NOTIFICATION_EMAILS,
                fail_silently=False,
            )

            return True

        except Exception as e:
            # logger.error(f"Failed to send agreement declined email: {str(e)}")
            return False

    # ==========================================
    # ENVIRONMENT VARIABLES
    # ==========================================


    """
    Add to your .env file:

    # Email Settings (Gmail example)
    EMAIL_HOST_USER=your-gmail@gmail.com
    EMAIL_HOST_PASSWORD=your-app-password

    # Admin Notifications
    ADMIN_EMAIL=admin@casa-community.com
    NOTIFICATION_EMAILS=admin@casa-community.com,hr@casa-community.com

    # PandaDoc
    PANDADOC_API_KEY=your-pandadoc-key
    """

    # ==========================================
    # GMAIL SETUP INSTRUCTIONS
    # ==========================================

    """
    GMAIL SETUP (Easiest for testing):

    1. Enable 2-Factor Authentication on your Gmail account
    2. Generate App Password:
    - Go to Google Account Settings
    - Security → 2-Step Verification → App Passwords
    - Generate password for "Mail"
    - Use this password in EMAIL_HOST_PASSWORD

    3. Add to .env:
    EMAIL_HOST_USER=your-email@gmail.com
    EMAIL_HOST_PASSWORD=generated-app-password

    4. Test email:
    python manage.py shell
    >>> from django.core.mail import send_mail
    >>> send_mail('Test', 'Hello', 'from@gmail.com', ['to@email.com'])

    PRODUCTION: Use SendGrid, Mailgun, or AWS SES for professional email delivery
    """

    # ==========================================
    # COMPLETE WORKFLOW SUMMARY
    # ==========================================

    """
    PERFECT AUTOMATED WORKFLOW:

    1. CLIENT COMPLETES PROFILE:
    ✅ Profile saved in database
    ✅ is_profile_completed = True
    ✅ Email sent to admin team
    ✅ ServiceAgreement record created

    2. ADMIN GETS EMAIL NOTIFICATION:
    📧 "New Client Profile Completed - John Smith"
    📋 All client details included
    🔗 Direct link to PandaDoc

    3. ADMIN CREATES AGREEMENT (3 minutes):
    📄 Open PandaDoc dashboard
    📝 Create from template
    ✉️ Send to client email
    📋 Copy signing URL to system

    4. CLIENT SIGNS AGREEMENT:
    🖱️ Click "Sign Agreement" button on dashboard
    ✍️ Sign in PandaDoc
    ✅ Document completed

    5. SYSTEM AUTO-UPDATES:
    🎣 Webhook receives completion notification
    💾 Database updated: status = 'SIGNED'
    📧 Admin gets "Agreement Signed" email
    🎉 Client dashboard shows "Onboarding Complete!"

    TOTAL ADMIN TIME: 3 minutes per client
    TOTAL DEVELOPMENT TIME: 2-3 hours setup
    CLIENT EXPERIENCE: Seamless and professional
    """
