from rest_framework.serializers import ModelSerializer
from apps.user.serializers import UserSerializer
from apps.participant.serializers import ParticipantSerializer
from . models import Document

class DocumentSerializer(ModelSerializer):
    # when you nest a serializer directly like this, DRF makes it read-only for incoming data by default.
    participant = ParticipantSerializer

    class Meta:
        model = Document
        fields = '__all__'
        extra_kwargs = {
            'id': {'read_only': True},
            'uuid': {'read_only': True},
            'uploaded_at': {'read_only': True}
        }

