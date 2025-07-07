from django.contrib import admin
from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView # type: ignore

urlpatterns = [
    path('client/signup/', views.client_signup, name='client_signup'),
    path('client/signin/', views.client_signin, name='client_signin'),
    path('employee/signup/', views.employee_signup, name='employee_signup'),
    path('employee/signin/', views.employee_signin, name='employee_signin'),
    path('signout/', views.signout, name='signout'),
    path('employee/add/', views.admin_add_employee, name='admin_add_employee'),
    path('employees/', views.admin_get_employees, name='admin_get_employee'),
    path('employee/update/', views.admin_update_employee, name='admin_update_employee'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh')
]
