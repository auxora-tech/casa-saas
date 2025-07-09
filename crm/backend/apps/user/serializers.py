from rest_framework.serializers import ModelSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(ModelSerializer):

    # class Meta is metadata, not a real class. Django/DRF reads its attributes but never creates instances.It exists because Python classes are a clean way to group settings.
    class Meta:
        model = User
        # whitelist fields. Only these fields are serialized
        fields = ['id', 'work_email', 'first_name',
                  'last_name', 'phone', 'date_joined', 'is_active']
        extra_kwargs = {
            # 'work_email': {'read_only': True},
            'date_joined': {'read_only': True}
        }
