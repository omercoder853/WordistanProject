from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import CustomUser

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only = True,min_length = 6)
    password_confirm = serializers.CharField(write_only = True)
    class Meta:
        model = CustomUser
        fields = ['email', 'first_name', 'last_name', 'nick_name', 'birth_date', 'gender', 'password', 'password_confirm']
    def validate(self,data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password": "Şifreler uyuşmuyor!"})
        return data
    def create(self,validated_data):
        validated_data.pop('password_confirm')
        user = CustomUser.objects.create_user(**validated_data)
        return user
    
class MyTokenObtainSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        achievement_list = list(self.user.achievements.values('achievementId', 'earned_at'))
        
        data['user'] = {
            'email' : self.user.email,
            'first_name':self.user.first_name,
            'last_name':self.user.last_name,
            'nick_name':self.user.nick_name,
            'birth_date':self.user.birth_date,
            'gender':self.user.gender,
            'date_joined':self.user.date_joined,
            'achievements':achievement_list,
        }
        return data
