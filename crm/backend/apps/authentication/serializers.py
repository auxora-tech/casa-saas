from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class SignupSerializer(serializers.Serializer):

    first_name = serializers.CharField()
    last_name = serializers.CharField()
    work_email = serializers.EmailField()
    password = serializers.CharField(write_only = True)

    def create(self, validated_data):
        user = User.objects.create_user(
            work_email = validated_data.get('work_email'),
            first_name = validated_data['first_name'],
            last_name = validated_data['last_name'],
            password = validated_data['password'],
            is_active = True
        )

        user.save()
        return user
    

class SigninSerializer(serializers.Serializer):

    work_email = serializers.EmailField()
    password = serializers.CharField(write_only = True)


