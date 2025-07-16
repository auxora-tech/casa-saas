from django.http import JsonResponse
from django.db import connection
from django.utils import timezone
from django.contrib import admin
from django.urls import path, include


def health_check(request):
    """Health check endpoint for load balancer"""
    try:
        # connection = Your Django database connection
        # cursor() = Creates a "pointer" to execute commands
        with connection.cursor() as cursor:
            # cursor.execute() = Send SQL command to database
            cursor.execute("SELECT 1")

        return JsonResponse({
            'status': 'healthy',
            'database': 'connected',
            'timestamp': timezone.now().isoformat()
        })
    except Exception as e:
        return JsonResponse({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': timezone.now().isoformat()
        }, status=500)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.authentication.urls')),
    path('api/admin/', include('apps.authentication.urls')),
    path('api/company/', include('apps.company.urls')), 
    path('api/client/', include('apps.participant.urls')),
    path('api/employee/', include('apps.employee.urls')),
    path('api/document/', include('apps.document.urls')),
    path('health/', health_check, name='health_check'),
]
