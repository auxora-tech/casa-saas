from django.urls import path
from . import views

urlpatterns = [
    path('profile/create-update/', views.create_update_employee_profile, name='create_update_profile'),
]
