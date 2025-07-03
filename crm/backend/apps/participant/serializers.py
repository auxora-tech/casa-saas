from rest_framework.serializers import ModelSerializer 
from .models import Participant
from apps.user.serializers import UserSerializer

class ParticipantSerializer(ModelSerializer):
    user = UserSerializer()
    class Meta:
        model = Participant
        fields = '__all__' 
        extra_kwargs = {
            'ndis_number': {'read_only': True},
        }
