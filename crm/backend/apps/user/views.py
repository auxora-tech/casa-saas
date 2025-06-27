from django.shortcuts import render
import secrets
import hashlib
from datetime import timedelta
from django.db import models, transaction
from django.utils import timezone
from django.core.mail import send_mail 
from django.template.loader import render_to_string 
from django.conf import settings
from django.core.cache import cache
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status 

# Create your views here.
from . models import User_Model
from apps.company.models import Company
from apps.membership.models import CompanyMembership
