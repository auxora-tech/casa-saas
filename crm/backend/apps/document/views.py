# Create your views here.
from django.shortcuts import redirect
from rest_framework.views import APIView
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .zoho_sign import ZohoSignService
from django.utils.decorators import method_decorator
from apps.participant.models import Participant
import json
import hmac
import hashlib
from django.conf import settings
import logging
from django.db import transaction
from .models import ServiceAgreement
from django.utils import timezone

zoho_service = ZohoSignService()
logger = logging.getLogger(__name__)


@method_decorator(csrf_exempt, name='dispatch')
class ZohoSignWebhook(APIView):
    # CRITICAL: These two lines are essential for webhooks
    authentication_classes = []  # No authentication for webhooks
    permission_classes = []     # No permissions for webhooks

    def post(self, request, *args, **kwargs):
        try:
            payload = json.loads(request.body)
            logger.info(f"Received Zoho Sign Webhook: {json.dumps(payload, indent=2)}")

            # --- HMAC Signature Verification ---
            zoho_signature = request.headers.get('X-Zoho-Signature')
            if not zoho_signature:
                logger.warning("Zoho Sign Webhook: Missing signature header.")
                return Response({'status': 'missing signature'}, status=status.HTTP_401_UNAUTHORIZED)
            
            expected_signature = self._generate_hmac_signature(request.body)
            if not hmac.compare_digest(expected_signature, zoho_signature):
                logger.warning("Zoho Sign Webhook: Invalid HMAC signature.")
                return Response({'status': 'invalid signature'}, status=status.HTTP_401_UNAUTHORIZED)

            event_type = payload.get('event')
            request_details = payload.get('requests', {})
            zoho_request_id = request_details.get('request_id')

            if not zoho_request_id:
                logger.warning("Zoho Sign Webhook received without request_id.")
                return Response({'status': 'missing request_id'}, status=status.HTTP_400_BAD_REQUEST)

            with transaction.atomic():
                try:
                    service_agreement = ServiceAgreement.objects.get(zoho_request_id=zoho_request_id)
                except ServiceAgreement.DoesNotExist:
                    logger.warning(f"Service Agreement with Zoho Request ID {zoho_request_id} not found for event {event_type}.")
                    return Response({'status': 'Service Agreement not found but webhook received'}, status=status.HTTP_200_OK)

                if event_type == 'request.completed':
                    # Extract custom fields filled by the client
                    field_values = request_details.get('field_data', {}).get('field_values', {})
                    
                    service_agreement.status = 'SIGNED'
                    service_agreement.signed_date = timezone.now()
                    
                    # Update signature dates based on actions
                    actions = request_details.get('actions', [])
                    for action in actions:
                        if action.get('action_type') == 'SIGN' and action.get('action_status') == 'COMPLETED':
                            action_time = timezone.now()  # You might want to parse action.get('action_time')
                            
                            # Determine which signature this is based on recipient or role
                            recipient_email = action.get('recipient_email', '')
                            
                            if 'casa' in recipient_email.lower() or 'admin' in recipient_email.lower():
                                service_agreement.casa_rep_signature_date = action_time
                            elif recipient_email == service_agreement.participant.user.email:
                                service_agreement.client_signature_date = action_time
                            elif service_agreement.guardian_email and recipient_email == service_agreement.guardian_email:
                                service_agreement.guardian_signature_date = action_time

                    # Update custom fields from webhook
                    if field_values:
                        service_agreement.client_additional_comments = field_values.get('client_additional_comments')
                        service_agreement.owner_additional_comments = field_values.get('owner_additional_comments')
                        service_agreement.informed_refusal_consent = field_values.get('informed_refusal_consent')
                        service_agreement.client_other_info = field_values.get('client_other_info')
                        service_agreement.can_participate_in_water = field_values.get('can_participate_in_water')
                        service_agreement.safe_participate_in_water = field_values.get('safe_participate_in_water')
                        service_agreement.casa_staff_provide_water_activity = field_values.get('casa_staff_provide_water_activity')
                        service_agreement.casa_staff_call_emergency_service = field_values.get('casa_staff_call_emergency_service')
                        service_agreement.casa_staff_share_information = field_values.get('casa_staff_share_information')
                        service_agreement.like_water = field_values.get('like_water')
                        service_agreement.able_swim = field_values.get('able_swim')
                        service_agreement.safe_water = field_values.get('safe_water')
                        service_agreement.tire_easily = field_values.get('tire_easily')
                        service_agreement.swimming_skill_level = field_values.get('swimming_skill_level')
                        service_agreement.energy_level = field_values.get('energy_level')
                        service_agreement.two_more_staff = field_values.get('two_more_staff')
                        service_agreement.current_complex_health_support_plan = field_values.get('current_complex_health_support_plan')
                        service_agreement.day_time_frequency = field_values.get('day_time_frequency')
                        service_agreement.support_ratio = field_values.get('support_ratio')
                        service_agreement.description = field_values.get('description')

                    logger.info(f"Service Agreement {service_agreement.id} ({zoho_request_id}) marked as SIGNED.")
                    service_agreement.save()

                elif event_type == 'request.declined':
                    service_agreement.status = 'DECLINED'
                    service_agreement.save()
                    logger.info(f"Service Agreement {service_agreement.id} ({zoho_request_id}) marked as DECLINED.")

                elif event_type == 'request.sent':
                    logger.info(f"Service Agreement {service_agreement.id} ({zoho_request_id}) sent for signing.")
                    # You might want to update status or send notifications here

                else:
                    logger.info(f"Unhandled Zoho Sign event type: {event_type} for Zoho Request ID {zoho_request_id}.")

                return Response({'status': 'success'}, status=status.HTTP_200_OK)

        except json.JSONDecodeError:
            logger.error("Zoho Sign Webhook: Invalid JSON payload.")
            return Response({'status': 'invalid json'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception(f"Error processing Zoho Sign Webhook: {e}")
            return Response({'status': 'internal server error', 'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _generate_hmac_signature(self, payload):
        """Generate HMAC signature for webhook verification"""
        secret = settings.ZOHO_WEBHOOK_SECRET.encode('utf-8')
        signature = hmac.new(secret, payload, hashlib.sha256).hexdigest()
        return signature


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def initiate_zoho_auth(request):
    """Initiate Zoho OAuth flow"""
    try:
        auth_url = zoho_service.get_auth_url()
        return Response({'auth_url': auth_url})
    except Exception as e:
        logger.error(f"Failed to initiate Zoho auth: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def zoho_callback(request):
    """Handle Zoho OAuth callback"""
    auth_code = request.GET.get('code')
    if auth_code:
        try:
            token_data = zoho_service.get_access_token(auth_code)
            logger.info("Zoho Sign connected successfully!")
            return Response({
                'success': True,
                'message': 'Zoho Sign connected successfully!',
                'token_data': token_data
            })
        except Exception as e:
            logger.error(f"Zoho callback failed: {e}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({'error': 'Authorization code not provided'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_service_agreement(request):
    """
    Creates a Service Agreement in the local database and sends it for signature via Zoho Sign.
    """
    try:
        # 1. Validate incoming data
        participant_id = request.data.get('participant_id')
        if not participant_id:
            return Response({'error': 'Participant ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            participant = Participant.objects.get(id=participant_id)
        except Participant.DoesNotExist:
            return Response({'error': 'Participant not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Guardian details from request
        guardian_name = request.data.get('guardian_name')
        guardian_email = request.data.get('guardian_email')
        guardian_address = request.data.get('guardian_address')
        guardian_contact = request.data.get('guardian_contact')

        # 2. Create ServiceAgreement instance
        with transaction.atomic():
            service_agreement = ServiceAgreement.objects.create(
                participant=participant,
                status='PENDING_SIGNATURE',
                casa_rep_name='Anju Isenth',
                client_name=participant.user.get_full_name(),
                client_email=participant.user.email,
                client_address=getattr(participant, 'address', ''),
                guardian_name=guardian_name,
                guardian_email=guardian_email,
                guardian_address=guardian_address,
                guardian_contact=guardian_contact,
            )
            
            logger.info(f"Created ServiceAgreement {service_agreement.id} for participant {participant.id}")

            # 3. Prepare recipients for Zoho Sign using exact template action_ids
            recipients = [
                {
                    "action_id": settings.ZOHO_TEMPLATE_ACTION_IDS['CASA_REP'],
                    "recipient_name": "Anju Isenth",  # Casa rep
                    "recipient_email": "casacommunityau@gmail.com",  # Your admin email
                    "action_type": "SIGN",
                    "signing_order": 1,
                    "role": "Casa Community Representative",
                    "verify_recipient": False,
                    "is_embedded": False,  # Casa rep gets email
                    "private_notes": "Casa Community representative signature"
                },
                {
                    "action_id": settings.ZOHO_TEMPLATE_ACTION_IDS['CLIENT'],
                    "recipient_name": participant.user.get_full_name(),
                    "recipient_email": participant.user.email,
                    "action_type": "SIGN",
                    "signing_order": 2,
                    "role": "Client",
                    "verify_recipient": False,
                    "is_embedded": True,  # Client signs in your dashboard
                    "private_notes": "NDIS participant signature"
                }
            ]

            # Add guardian if provided
            if guardian_name and guardian_email:
                recipients.append({
                    "action_id": settings.ZOHO_TEMPLATE_ACTION_IDS['GUARDIAN'],
                    "recipient_name": guardian_name,
                    "recipient_email": guardian_email,
                    "action_type": "SIGN",
                    "signing_order": 3,
                    "role": "Client Guardian/Representative",
                    "verify_recipient": False,
                    "is_embedded": False,  # Guardian gets email
                    "private_notes": "Guardian/Representative signature"
                })

            # 4. Prepare field values for pre-filling
            field_values = {
                'casa_rep_name': service_agreement.casa_rep_name,
                'client_name': participant.user.get_full_name(),
                'client_email': participant.user.email,
                'client_address': getattr(participant, 'address', ''),
                'ndis_number': getattr(participant, 'ndis_number', ''),
                'agreement_date': timezone.now().strftime('%Y-%m-%d'),
                'guardian_name': guardian_name or '',
                'guardian_email': guardian_email or '',
                'guardian_address': guardian_address or '',
                'guardian_contact': guardian_contact or '',
            }

            # 5. Send document via Zoho Sign
            template_id = settings.ZOHO_SERVICE_AGREEMENT_TEMPLATE_ID
            if not template_id:
                raise ValueError("ZOHO_SERVICE_AGREEMENT_TEMPLATE_ID is not configured in settings.")

            logger.info(f"Sending document from template {template_id} for ServiceAgreement {service_agreement.id}")
            
            zoho_response = zoho_service.send_document_from_template(
                template_id=template_id,
                recipients=recipients,
                document_details={"field_values": field_values}
            )

            # 6. Extract request_id from response
            request_id = zoho_response['requests']['request_id']
            
            # 7. Save Zoho request_id
            service_agreement.zoho_request_id = request_id
            service_agreement.save()
            
            logger.info(f"ServiceAgreement {service_agreement.id} updated with Zoho request_id: {request_id}")

            # 8. Get embedded signing URL for client using exact action_id
            try:
                # Use the specific action_id for the Client role from settings
                client_action_id = settings.ZOHO_TEMPLATE_ACTION_IDS['CLIENT']
                
                signing_url = zoho_service.get_embedded_signing_url(request_id, client_action_id)
                logger.info(f"Generated embedded signing URL for ServiceAgreement {service_agreement.id}")
                
            except Exception as e:
                logger.warning(f"Failed to generate embedded signing URL: {e}")
                signing_url = None

            # 9. Return success response
            return Response({
                'success': True,
                'service_agreement_id': service_agreement.id,
                'zoho_request_id': request_id,
                'signing_url': signing_url,
                'message': 'Service agreement created and sent for signature successfully!',
                'recipients': len(recipients)
            }, status=status.HTTP_200_OK)

    except ValueError as e:
        logger.error(f"Configuration error: {e}")
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.exception("Error in create_service_agreement")
        return Response({
            'error': 'An internal server error occurred.',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_document_status(request, request_id):
    """Check signing status of document"""
    try:
        status_data = zoho_service.get_document_status(request_id)
        return Response(status_data)
    except Exception as e:
        logger.error(f"Failed to check document status: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_signed_agreement(request, request_id):
    """Download completed signed document"""
    try:
        pdf_content = zoho_service.download_signed_document(request_id)
        
        response = HttpResponse(pdf_content, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="service_agreement_{request_id}.pdf"'
        return response
        
    except Exception as e:
        logger.error(f"Failed to download signed document: {e}")
        return JsonResponse({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_signing_url(request, service_agreement_id):
    """Get embedded signing URL for a specific service agreement"""
    try:
        service_agreement = ServiceAgreement.objects.get(id=service_agreement_id)
        
        if not service_agreement.zoho_request_id:
            return Response({'error': 'Service agreement not sent to Zoho yet'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Use the predefined Client action_id from settings
        client_action_id = settings.ZOHO_TEMPLATE_ACTION_IDS['CLIENT']
        
        signing_url = zoho_service.get_embedded_signing_url(
            service_agreement.zoho_request_id, 
            client_action_id
        )
        
        return Response({
            'signing_url': signing_url,
            'service_agreement_id': service_agreement.id,
            'status': service_agreement.status
        })
        
    except ServiceAgreement.DoesNotExist:
        return Response({'error': 'Service agreement not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Failed to get signing URL: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_service_agreements(request):
    """List service agreements for the current user"""
    try:
        # If user is a participant, show their agreements
        if hasattr(request.user, 'participant'):
            agreements = ServiceAgreement.objects.filter(participant=request.user.participant)
        else:
            # If user is staff, show all agreements
            agreements = ServiceAgreement.objects.all()
        
        agreements_data = []
        for agreement in agreements:
            agreements_data.append({
                'id': agreement.id,
                'participant_name': agreement.participant.user.get_full_name(),
                'status': agreement.status,
                'created_at': agreement.created_at,
                'signed_date': agreement.signed_date,
                'zoho_request_id': agreement.zoho_request_id,
                'guardian_name': agreement.guardian_name,
                'casa_rep_name': agreement.casa_rep_name,
            })
        
        return Response({'agreements': agreements_data})
        
    except Exception as e:
        logger.error(f"Failed to list service agreements: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_service_agreement_details(request, service_agreement_id):
    """Get detailed information about a specific service agreement"""
    try:
        service_agreement = ServiceAgreement.objects.get(id=service_agreement_id)
        
        # Check permissions - participants can only see their own agreements
        if hasattr(request.user, 'participant') and service_agreement.participant != request.user.participant:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        agreement_data = {
            'id': service_agreement.id,
            'participant': {
                'id': service_agreement.participant.id,
                'name': service_agreement.participant.user.get_full_name(),
                'email': service_agreement.participant.user.email,
            },
            'status': service_agreement.status,
            'zoho_request_id': service_agreement.zoho_request_id,
            'created_at': service_agreement.created_at,
            'signed_date': service_agreement.signed_date,
            'casa_rep_name': service_agreement.casa_rep_name,
            'casa_rep_signature_date': service_agreement.casa_rep_signature_date,
            'client_signature_date': service_agreement.client_signature_date,
            'guardian_signature_date': service_agreement.guardian_signature_date,
            'guardian_name': service_agreement.guardian_name,
            'guardian_email': service_agreement.guardian_email,
            'guardian_address': service_agreement.guardian_address,
            'guardian_contact': service_agreement.guardian_contact,
            'client_additional_comments': service_agreement.client_additional_comments,
            'owner_additional_comments': service_agreement.owner_additional_comments,
            'informed_refusal_consent': service_agreement.informed_refusal_consent,
            'client_other_info': service_agreement.client_other_info,
            # Water activity fields
            'can_participate_in_water': service_agreement.can_participate_in_water,
            'safe_participate_in_water': service_agreement.safe_participate_in_water,
            'casa_staff_provide_water_activity': service_agreement.casa_staff_provide_water_activity,
            'casa_staff_call_emergency_service': service_agreement.casa_staff_call_emergency_service,
            'casa_staff_share_information': service_agreement.casa_staff_share_information,
            # Skill level fields
            'like_water': service_agreement.like_water,
            'able_swim': service_agreement.able_swim,
            'safe_water': service_agreement.safe_water,
            'tire_easily': service_agreement.tire_easily,
            'swimming_skill_level': service_agreement.swimming_skill_level,
            'energy_level': service_agreement.energy_level,
            'two_more_staff': service_agreement.two_more_staff,
            'current_complex_health_support_plan': service_agreement.current_complex_health_support_plan,
            # Schedule fields
            'day_time_frequency': service_agreement.day_time_frequency,
            'support_ratio': service_agreement.support_ratio,
            'description': service_agreement.description,
        }
        
        return Response({'agreement': agreement_data})
        
    except ServiceAgreement.DoesNotExist:
        return Response({'error': 'Service agreement not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Failed to get service agreement details: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
