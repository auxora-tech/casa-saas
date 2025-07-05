from django.contrib import admin
from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView # type: ignore

urlpatterns = [
    path('signup/', views.signup, name='signup'),
    path('signin/', views.signin, name='signin'),
    path('singout/', views.signout, name='signout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh')
]
