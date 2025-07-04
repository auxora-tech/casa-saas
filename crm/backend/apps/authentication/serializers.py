from rest_framework import serializers
from django.conf import settings

User = settings.AUTH_USER_MODEL

class SignupSerializer(serializers.Serializer):

    first_name = serializers.CharField()
    last_name = serializers.CharField()
    work_email = serializers.EmailField(read_only = True)
    password = serializers.CharField(write_only = True)

    def create(self, validated_data):
        user = User.objects.create_user(
            work_email = validated_data['work_email'],
            first_name = validated_data['first_name'],
            last_name = validated_data['last_name'],
            password = validated_data['password']
        )

        user.save()
        return user
