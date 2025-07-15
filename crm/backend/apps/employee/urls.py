from django.urls import path
from . import views

urlpatterns = [
    path('profile/create-update/', views.create_update_employee_profile, name='create_update_profile'),
    path('notes/', views.get_employee_notes, name='employee_notes'),
    path('note/add/', views.add_note, name='add_employee_note')
]
