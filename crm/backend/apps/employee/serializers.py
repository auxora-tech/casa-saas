from rest_framework.serializers import ModelSerializer
from . models import Employee
from apps.user.serializers import UserSerializer

class EmployeeSerializer(ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Employee
        fields = '__all__'
        extra_kwargs = {
            'tfn': {'read_only': True},
            'bsb': {'read_only': True},
            'account_number': {'read_only': True},
        }
