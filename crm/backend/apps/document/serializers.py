from rest_framework.serializers import ModelSerializer
from apps.user.serializers import UserSerializer
from . models import Document

class DocumentSerializer(ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Document
        fields = ['user', 'title', 'file']
        extra_kwargs = {
            'id': {'read_only': True},
            'uuid': {'read_only': True},
            'uploaded_at': {'read_only': True}
        }

