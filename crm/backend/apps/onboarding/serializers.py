from rest_framework.serializers import ModelSerializer
from apps.user.serializers import UserSerializer
from . models import OnboardingStatus

class OnBoardingSerializer(ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = OnboardingStatus
        fields = ['user', 'is_profile_completed', 'is_document_uploaded', 'completed_at']
        extra_kwargs = {
            'id': {'read_only': True},
            'uuid': {'read_only': True},
        }

