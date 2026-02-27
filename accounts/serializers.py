from rest_framework import serializers
from .models import CustomUser

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only = True,min_length = 6)
    password_confirm = serializers.CharField(write_only = True)
    class Meta:
        model = CustomUser
        fields = ['email', 'first_name', 'last_name', 'nick_name', 'birth_date', 'password', 'password_confirm']
    def validate(self,data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password": "Şifreler uyuşmuyor!"})
        return data
    def create(self,validated_data):
        validated_data.pop('password_confirm')
        user = CustomUser.objects.create_user(**validated_data)
        return user
