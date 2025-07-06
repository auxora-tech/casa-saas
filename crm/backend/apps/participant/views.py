# ==========================================
# UPDATED CLIENT PROFILE VIEWS - MATCHING MODEL
# ==========================================

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from . models import Participant
from apps.membership.models import CompanyMembership
from decimal import Decimal
from datetime import datetime

# ==========================================
# GET CLIENT PROFILE
# ==========================================


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_client_profile(request):
    """
    Get current client's profile information
    URL: /api/client/profile/
    """

    # Verify user is a client
    try:
        membership = CompanyMembership.objects.get(
            user=request.user,
            company__title='Casa Community Pty Ltd',
            role='CLIENT'
        )
    except CompanyMembership.DoesNotExist:
        return Response({
            'error': 'Access denied. Client account required.'
        }, status=status.HTTP_403_FORBIDDEN)

    # Get or create participant profile
    try:
        participant = Participant.objects.get(user=request.user)
        profile_exists = True
    except Participant.DoesNotExist:
        # Return empty profile structure
        profile_exists = False
        participant = None

    if profile_exists:
        profile_data = {
            'id': participant.id,
            'uuid': str(participant.uuid),
            'is_profile_completed': participant.is_profile_completed,

            # Basic Info (NEW/UPDATED FIELDS)
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
            'email': request.user.work_email,
            'preferred_name': participant.preferred_name,
            'date_of_birth': participant.date_of_birth.strftime('%Y-%m-%d') if participant.date_of_birth else None,
            'address': participant.address,
            'phone': str(participant.phone) if participant.phone else None,
            'photo': participant.photo.url if participant.photo else None,

            # Personal Details (UPDATED with gender choice)
            'gender': participant.gender,
            'height': float(participant.height) if participant.height else None,
            'weight': float(participant.weight) if participant.weight else None,
            'hair_colour': participant.hair_colour,
            'eye_colour': participant.eye_colour,
            'spoken_language': participant.spoken_language,
            'distinguishing_features': participant.distinguishing_features,
            'clothing_size': float(participant.clothing_size) if participant.clothing_size else None,
            'shoe_size': float(participant.shoe_size) if participant.shoe_size else None,
            'religion_or_culture': participant.religion_or_culture,

            # NDIS Info
            'ndis_number': participant.ndis_number,
            'ndis_plan_start': participant.ndis_plan_start.strftime('%Y-%m-%d') if participant.ndis_plan_start else None,
            'ndis_plan_end': participant.ndis_plan_end.strftime('%Y-%m-%d') if participant.ndis_plan_end else None,
            'ndis_plan_managed_details': participant.ndis_plan_managed_details,

            # Cards & Insurance
            'pension_type': participant.pension_type,
            'pension_number': participant.pension_number,
            'pension_expiry': participant.pension_expiry.strftime('%Y-%m-%d') if participant.pension_expiry else None,
            'private_insurance_type': participant.private_insurance_type,
            'private_insurance_number': participant.private_insurance_number,
            'private_insurance_expiry': participant.private_insurance_expiry.strftime('%Y-%m-%d') if participant.private_insurance_expiry else None,
            'medicare_number': participant.medicare_number,
            'medicare_expiry': participant.medicare_expiry.strftime('%Y-%m-%d') if participant.medicare_expiry else None,
            'healthcare_card_number': participant.healthcare_card_number,
            'healthcare_card_expiry': participant.healthcare_card_expiry.strftime('%Y-%m-%d') if participant.healthcare_card_expiry else None,
            'companion_card_number': participant.companion_card_number,
            'companion_card_expiry': participant.companion_card_expiry.strftime('%Y-%m-%d') if participant.companion_card_expiry else None,

            # Emergency Contacts
            'emergency_contact_1': str(participant.emergency_contact_1) if participant.emergency_contact_1 else None,
            'emergency_contact_2': str(participant.emergency_contact_2) if participant.emergency_contact_2 else None,

            # Medical requirements
            'name_of_doctor': participant.name_of_doctor,
            'medical_food_other_allergies': participant.medical_food_other_allergies,
            'medical_condition': participant.medical_condition,
            'dietary_requirements': participant.dietary_requirements,

            # About Me
            'likes': participant.likes,
            'dislikes': participant.dislikes,
            'hobbies_interests': participant.hobbies_interests,
            'supports_required': participant.supports_required,
            'level_assistance_required': participant.level_assistance_required,

            # Specific Needs and Support (all boolean fields with details)
            'opg_guardian_consent_required': participant.opg_guardian_consent_required,
            'opg_guardian_consent_required_details': participant.opg_guardian_consent_required_details,
            'public_trustee_or_financial_administrator': participant.public_trustee_or_financial_administrator,
            'public_trustee_or_financial_administrator_details': participant.public_trustee_or_financial_administrator_details,
            'behaviour_management': participant.behaviour_management,
            'behaviour_management_details': participant.behaviour_management_details,
            'restrictive_practices': participant.restrictive_practices,
            'restrictive_practices_details': participant.restrictive_practices_details,
            'complex_health_support_plan': participant.complex_health_support_plan,
            'complex_health_support_plan_details': participant.complex_health_support_plan_details,
            'unsupported_time': participant.unsupported_time,
            'unsupported_time_details': participant.unsupported_time_details,

            # Daily Living Support
            'mobility': participant.mobility,
            'mobility_details': participant.Mobility_details,  # Note: capital M in model
            'aids_equipment': participant.aids_equipment,
            'aids_equipment_details': participant.aids_equipment_details,
            'communication': participant.communication,
            'communication_details': participant.communication_details,
            'eating': participant.eating,
            'eating_details': participant.eating_details,
            'menstrual_management': participant.menstrual_management,
            'menstrual_management_details': participant.menstrual_management_details,
            'toileting': participant.toileting,
            'toileting_details': participant.toileting_details,
            'getting_drinks': participant.getting_drinks,
            'getting_drinks_details': participant.getting_drinks_details,
            'food_preparation': participant.food_preparation,
            'food_preparation_details': participant.food_preparation_details,
            'dressing': participant.dressing,
            'dressing_details': participant.dressing_details,
            'showering_or_bathing': participant.showering_or_bathing,
            'showering_or_bathing_details': participant.showering_or_bathing_details,
            'medication': participant.medication,
            'medication_details': participant.medication_details,

            # Social and Community Support
            'friendships_or_relationships': participant.friendships_or_relationships,
            'friendships_or_relationships_details': participant.friendships_or_relationships_details,
            'home_safety_and_security': participant.home_safety_and_security,
            'home_safety_and_security_details': participant.home_safety_and_security_details,
            'community_access': participant.community_access,
            'community_access_details': participant.community_access_details,
            'personal_or_road_safety': participant.personal_or_road_safety,
            'personal_or_road_safety_details': participant.personal_or_road_safety_details,
            'transport_or_travel': participant.transport_or_travel,
            'transport_or_travel_details': participant.transport_or_travel_details,

            # Life Skills Support
            'chores': participant.chores,
            'chores_details': participant.chores_details,
            'hobbies_or_activities': participant.hobbies_or_activities,
            'hobbies_or_activities_details': participant.hobbies_or_activities_details,
            'pet_care': participant.pet_care,
            'pet_care_details': participant.pet_care_details,
            'handling_money_or_budgeting': participant.handling_money_or_budgeting,
            'handling_money_or_budgeting_details': participant.handling_money_or_budgeting_details,
            'education_or_employment': participant.education_or_employment,
            'education_or_employment_details': participant.education_or_employment_details,
            'learning_new_skills': participant.learning_new_skills,
            'learning_new_skills_details': participant.learning_new_skills_details,
            'other_needs_and_support': participant.other_needs_and_support,
            'other_needs_and_support_details': participant.other_needs_and_support_details,

            'created_at': participant.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'updated_at': participant.updated_at.strftime('%Y-%m-%d %H:%M:%S'),
        }
    else:
        profile_data = {
            'profile_exists': False,
            'message': 'Profile not created yet. Please complete your profile.'
        }

    return Response({
        'user': {
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
            'email': request.user.work_email
        },
        'profile': profile_data,
        'profile_exists': profile_exists
    })

# ==========================================
# CREATE/UPDATE CLIENT PROFILE
# ==========================================


@api_view(['POST', 'PUT'])
@permission_classes([IsAuthenticated])
def create_update_client_profile(request):
    """
    Create or update client profile
    URL: /api/client/profile/
    
    Expected payload structure:
    {
        // Basic Info (NEW REQUIRED FIELDS)
        "preferred_name": "John",
        "date_of_birth": "1990-05-15",
        "address": "123 Main St, Adelaide SA 5000",
        "phone": "+61412345678",
        
        // NDIS Info (REQUIRED)
        "ndis_number": "123456789",
        "ndis_plan_start": "2024-01-01",
        "ndis_plan_end": "2024-12-31",
        "ndis_plan_managed_details": "Self-managed",
        
        // Emergency Contacts (REQUIRED)
        "emergency_contact_1": "+61412345678",
        "emergency_contact_2": "+61412345679",
        
        // Personal Details (OPTIONAL)
        "gender": "M",
        "height": 175.5,
        "weight": 70.0,
        "hair_colour": "Brown",
        "eye_colour": "Blue",
        "spoken_language": "English",
        
        // Medical (OPTIONAL)
        "medical_condition": "Autism",
        "dietary_requirements": "Vegetarian",
        
        // Support Needs (OPTIONAL)
        "mobility": true,
        "mobility_details": "Uses wheelchair",
        "communication": false,
        "medication": true,
        "medication_details": "Takes daily vitamins",
        // ... other support fields
    }
    """

    # Verify user is a client
    try:
        membership = CompanyMembership.objects.get(
            user=request.user,
            company__title='Casa Community Pty Ltd',
            role='CLIENT'
        )
    except CompanyMembership.DoesNotExist:
        return Response({
            'error': 'Access denied. Client account required.'
        }, status=status.HTTP_403_FORBIDDEN)

    # Get data from request
    data = request.data

    # Updated required fields (based on new model structure)
    required_fields = [
        'first_name', 'last_name', 'email', 'date_of_birth', 'address', 'phone',  # NEW required fields
        'ndis_number', 'ndis_plan_start', 'ndis_plan_end',
        'ndis_plan_managed_details', 'emergency_contact_1', 'emergency_contact_2'
    ]

    missing_fields = []
    for field in required_fields:
        if not data.get(field):
            missing_fields.append(field)

    if missing_fields:
        return Response({
            'error': 'Required fields are missing',
            'missing_fields': missing_fields,
            'required_fields': required_fields
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        with transaction.atomic():
            # Get or create participant profile
            participant, created = Participant.objects.get_or_create(
                user=request.user,
                defaults={
                    # NEW required fields
                    'first_name': request.user.first_name,
                    'last_name': request.user.last_name,
                    'email': request.user.work_email,
                    'date_of_birth': datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date(),
                    'address': data['address'],
                    'phone': data['phone'],
                    # NDIS fields
                    'ndis_number': data['ndis_number'],
                    'ndis_plan_start': datetime.strptime(data['ndis_plan_start'], '%Y-%m-%d').date(),
                    'ndis_plan_end': datetime.strptime(data['ndis_plan_end'], '%Y-%m-%d').date(),
                    'ndis_plan_managed_details': data['ndis_plan_managed_details'],
                    # Emergency contacts
                    'emergency_contact_1': data['emergency_contact_1'],
                    'emergency_contact_2': data['emergency_contact_2'],
                }
            )

            if not created:
                # Update existing profile with new required fields
                participant.date_of_birth = datetime.strptime(
                    data['date_of_birth'], '%Y-%m-%d').date()
                participant.address = data['address']
                participant.phone = data['phone']
                participant.ndis_number = data.get(
                    'ndis_number', participant.ndis_number)
                participant.ndis_plan_start = datetime.strptime(
                    data['ndis_plan_start'], '%Y-%m-%d').date()
                participant.ndis_plan_end = datetime.strptime(
                    data['ndis_plan_end'], '%Y-%m-%d').date()
                participant.ndis_plan_managed_details = data.get(
                    'ndis_plan_managed_details', participant.ndis_plan_managed_details)
                participant.emergency_contact_1 = data.get(
                    'emergency_contact_1', participant.emergency_contact_1)
                participant.emergency_contact_2 = data.get(
                    'emergency_contact_2', participant.emergency_contact_2)

            # Update optional basic fields
            optional_basic_fields = {
                'preferred_name': 'preferred_name',
                'gender': 'gender',  # NEW field
                'height': 'height',
                'weight': 'weight',
                'hair_colour': 'hair_colour',
                'eye_colour': 'eye_colour',
                'spoken_language': 'spoken_language',
                'distinguishing_features': 'distinguishing_features',
                'clothing_size': 'clothing_size',
                'shoe_size': 'shoe_size',
                'religion_or_culture': 'religion_or_culture',
            }

            for api_field, model_field in optional_basic_fields.items():
                if data.get(api_field) is not None:
                    setattr(participant, model_field, data[api_field])

            # Update insurance and cards fields
            insurance_fields = {
                'pension_type': 'pension_type',
                'pension_number': 'pension_number',
                'private_insurance_type': 'private_insurance_type',
                'private_insurance_number': 'private_insurance_number',
                'medicare_number': 'medicare_number',
                'healthcare_card_number': 'healthcare_card_number',
                'companion_card_number': 'companion_card_number'
            }

            for api_field, model_field in insurance_fields.items():
                if data.get(api_field) is not None:
                    setattr(participant, model_field, data[api_field])

            # Update medical fields
            medical_fields = {
                'name_of_doctor': 'name_of_doctor',
                'medical_food_other_allergies': 'medical_food_other_allergies',
                'medical_condition': 'medical_condition',
                'dietary_requirements': 'dietary_requirements'
            }

            for api_field, model_field in medical_fields.items():
                if data.get(api_field) is not None:
                    setattr(participant, model_field, data[api_field])

            # Update about me fields
            about_me_fields = {
                'likes': 'likes',
                'dislikes': 'dislikes',
                'hobbies_interests': 'hobbies_interests',
                'supports_required': 'supports_required',
                'level_assistance_required': 'level_assistance_required'
            }

            for api_field, model_field in about_me_fields.items():
                if data.get(api_field) is not None:
                    setattr(participant, model_field, data[api_field])

            # Handle date fields
            date_fields = ['pension_expiry', 'private_insurance_expiry', 'medicare_expiry',
                           'healthcare_card_expiry', 'companion_card_expiry']
            for field in date_fields:
                if data.get(field):
                    try:
                        setattr(participant, field, datetime.strptime(
                            data[field], '%Y-%m-%d').date())
                    except ValueError:
                        return Response({
                            'error': f'Invalid date format for {field}. Use YYYY-MM-DD format.'
                        }, status=status.HTTP_400_BAD_REQUEST)

            # Handle all boolean support fields with their details
            support_boolean_fields = [
                'opg_guardian_consent_required', 'public_trustee_or_financial_administrator',
                'behaviour_management', 'restrictive_practices', 'complex_health_support_plan',
                'unsupported_time', 'mobility', 'aids_equipment', 'communication', 'eating',
                'menstrual_management', 'toileting', 'getting_drinks', 'food_preparation',
                'dressing', 'showering_or_bathing', 'medication', 'friendships_or_relationships',
                'home_safety_and_security', 'community_access', 'personal_or_road_safety',
                'transport_or_travel', 'chores', 'hobbies_or_activities', 'pet_care',
                'handling_money_or_budgeting', 'education_or_employment', 'learning_new_skills',
                'other_needs_and_support'
            ]

            for field in support_boolean_fields:
                if data.get(field) is not None:
                    setattr(participant, field, data[field])

                    # Handle corresponding details field
                    details_field = f"{field}_details"
                    if data.get(details_field) is not None:
                        # Special case for mobility details (model has capital M)
                        if field == 'mobility':
                            setattr(participant, 'Mobility_details',
                                    data[details_field])
                        else:
                            setattr(participant, details_field,
                                    data[details_field])

            # Check if profile is completed (updated criteria)
            profile_completion_fields = [
                participant.date_of_birth, participant.address, participant.phone,  # NEW requirements
                participant.ndis_number, participant.ndis_plan_start, participant.ndis_plan_end,
                participant.emergency_contact_1, participant.emergency_contact_2
            ]

            if all(profile_completion_fields):
                participant.is_profile_completed = True

            participant.save()

            action = 'created' if created else 'updated'

            return Response({
                'success': True,
                'message': f'Profile {action} successfully!',
                'profile': {
                    'id': participant.id,
                    'uuid': str(participant.uuid),
                    'ndis_number': participant.ndis_number,
                    'preferred_name': participant.preferred_name,
                    'is_profile_completed': participant.is_profile_completed,
                },
                'action': action,
                'next_steps': [
                    'Your profile has been saved',
                    'You can now access all NDIS services',
                    'Support workers can view your care requirements'
                ] if participant.is_profile_completed else [
                    'Profile saved as draft',
                    'Please complete remaining required fields',
                    'Complete profile to access all features'
                ]
            }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    except ValueError as e:
        return Response({
            'error': 'Invalid data format',
            'details': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'error': 'Failed to save profile',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ==========================================
# PROFILE COMPLETION STATUS
# ==========================================


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile_completion_status(request):
    """
    Get profile completion status and missing fields
    URL: /api/client/profile/status/
    """

    try:
        membership = CompanyMembership.objects.get(
            user=request.user,
            company__title='Casa Community Pty Ltd',
            role='CLIENT'
        )
    except CompanyMembership.DoesNotExist:
        return Response({
            'error': 'Access denied. Client account required.'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        participant = Participant.objects.get(user=request.user)

        # Check required fields (UPDATED)
        required_checks = {
            'basic_info': bool(participant.date_of_birth and participant.address and participant.phone),
            'ndis_number': bool(participant.ndis_number),
            'ndis_plan_dates': bool(participant.ndis_plan_start and participant.ndis_plan_end),
            'emergency_contacts': bool(participant.emergency_contact_1 and participant.emergency_contact_2),
            'ndis_plan_details': bool(participant.ndis_plan_managed_details)
        }

        # Check optional important fields
        optional_checks = {
            'personal_details': bool(participant.preferred_name and participant.gender),
            'medical_info': bool(participant.medical_condition or participant.medical_food_other_allergies),
            'dietary_requirements': bool(participant.dietary_requirements),
            'daily_living_support': any([
                participant.mobility, participant.communication, participant.medication,
                participant.eating, participant.dressing, participant.toileting
            ]),
            'community_support': any([
                participant.community_access, participant.transport_or_travel,
                participant.friendships_or_relationships
            ]),
            'life_skills': any([
                participant.education_or_employment, participant.handling_money_or_budgeting,
                participant.learning_new_skills, participant.chores
            ]),
            'about_me': bool(participant.likes or participant.dislikes or participant.hobbies_interests)
        }

        completed_required = sum(required_checks.values())
        total_required = len(required_checks)

        completed_optional = sum(optional_checks.values())
        total_optional = len(optional_checks)

        overall_completion = (
            (completed_required + completed_optional) / (total_required + total_optional)) * 100

        return Response({
            'profile_exists': True,
            'is_completed': participant.is_profile_completed,
            'completion_percentage': round(overall_completion, 1),
            'required_fields': {
                'completed': completed_required,
                'total': total_required,
                'status': required_checks
            },
            'optional_fields': {
                'completed': completed_optional,
                'total': total_optional,
                'status': optional_checks
            },
            'recommendations': [
                'Complete basic information (address, phone, date of birth)' if not required_checks[
                    'basic_info'] else None,
                'Add emergency contact information' if not required_checks[
                    'emergency_contacts'] else None,
                'Add personal details (preferred name, gender)' if not optional_checks[
                    'personal_details'] else None,
                'Add medical condition details' if not optional_checks['medical_info'] else None,
                'Specify dietary requirements' if not optional_checks['dietary_requirements'] else None,
                'Detail your daily living support needs' if not optional_checks[
                    'daily_living_support'] else None,
                'Add community and social support needs' if not optional_checks[
                    'community_support'] else None
            ]
        })

    except Participant.DoesNotExist:
        return Response({
            'profile_exists': False,
            'is_completed': False,
            'completion_percentage': 0,
            'message': 'Profile not created yet',
            'next_steps': ['Create your NDIS participant profile to get started']
        })


