from django.urls import path
from . import views

urlpatterns = [
    path('profile/get', views.get_client_profile, name='get_client_profile'),  # GET
    path('profile/add-update', views.create_update_client_profile, name='create_update_client_profile'),  # POST/PUT
    path('profile/status', views.get_profile_completion_status, name='profile_completion_status'),
]
