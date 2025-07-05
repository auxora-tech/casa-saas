from rest_framework.serializers import ModelSerializer
from . models import Company


class CompanySerializer(ModelSerializer):

    class Meta:
        model = Company
        fields = ['id','uuid', 'title', 'category',
                  'no_of_employees', 'country', 'is_active','address','subscription_plan', 'website']
        extra_kwargs = {
            'id': {'read_only': True},
            'uuid': {'read_only': True},
            'title': {'required': True},
            'website': {'required': False},
        }
