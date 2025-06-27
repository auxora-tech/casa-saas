from rest_framework.serializers import ModelSerializer
from . models import Company


class CompanySerializer(ModelSerializer):

    class Meta:
        model = Company
        fields = ['id', 'title', 'category',
                  'no_of_employees', 'country', 'is_active']
        extra_kwargs = {
            'id': {'read_only': True},
            'title': {'read_only': True}
        }
