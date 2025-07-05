from django.utils import timezone
from django.conf import settings
from django.core.cache import cache
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, permissions
# from django.db import transaction
from rest_framework_simplejwt.tokens import RefreshToken  # type: ignore
from . serializers import CompanySerializer
from apps.membership.models import CompanyMembership
from . models import Company


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create(request):

    serialized_data = CompanySerializer(request.data)

    if serialized_data.is_valid():
        company = serialized_data.save(is_active = True)

        CompanyMembership.objects.create(
            user = request.user,
            company = company,
            role = 'ADMIN',
            is_active = True
        )

        return Response({
            'message': f'{company.title}, has been successfully created and linked to you as ADMIN',
            'company': {
                'UUID': company.uuid,
                'Title': company.title,
                'Number of Employees': company.no_of_employees,
                'Country': company.country,
                'Address': company.address,
                'Is Active': company.is_active
            },
            'user':{
                'UUID': request.user.uuid,
                'First Name': request.user.first_name,
                'Last Name': request.user.last_name
            }
        }, status = status.HTTP_201_CREATED)
    
    # if validation fails

    return Response({
        'error': 'Invalid data',
        'details': serialized_data.errors
    }, status = status.HTTP_400_BAD_REQUEST)

