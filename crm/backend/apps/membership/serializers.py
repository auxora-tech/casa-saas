from rest_framework.serializers import ModelSerializer
from . models import CompanyMembership 
from apps.company.serializers import CompanySerializer
from apps.user.serializers import UserSerializer


class CompanyMembershipSerializer(ModelSerializer):

    company = CompanySerializer()
    user = UserSerializer()

    class Meta:
        model = CompanyMembership
        fields = ['id', 'user', 'company', 'role', 'is_active', 'joined_at', 'left_at']

        extra_kwargs = {
            'joined_at' : {'read_only' : True}
        }
