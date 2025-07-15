from django.urls import path
from . import views

urlpatterns = [
    path('zoho/auth/', views.initiate_zoho_auth, name='initiate_zoho_auth'),
    path('zoho/callback/', views.zoho_callback, name='zoho_callback'),

    # Webhook URL
    path('zoho/webhook/', views.ZohoSignWebhook.as_view(), name='zoho_webhook'),

    # Service Agreement URLs
    path('service-agreements/create/', views.create_service_agreement,name='create_service_agreement'),
    path('service-agreements/', views.list_service_agreements,name='list_service_agreements'),
    path('service-agreements/<int:service_agreement_id>/',views.get_service_agreement_details, name='service_agreement_details'),
    path('service-agreements/<int:service_agreement_id>/signing-url/',views.get_signing_url, name='get_signing_url'),

    # Document management URLs
    path('documents/<str:request_id>/status/',views.check_document_status, name='check_document_status'),
    path('documents/<str:request_id>/download/',views.download_signed_agreement, name='download_signed_agreement'),
]
