from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils import timezone
from django.contrib.auth.base_user import BaseUserManager


# User oluşturmak için manager
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email zorunludur")
        email = self.normalize_email(email)  # Küçük harfe çevirip standardize eder
        user = self.model(email=email, **extra_fields)  # User objesi oluşturur
        user.set_password(password)  # Şifreyi hashleyip kaydeder
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)  # Admin paneline giriş yetkisi
        extra_fields.setdefault("is_superuser", True)  # Tüm izinler
        extra_fields.setdefault("is_active", True)  # Kullanıcı aktif

        return self.create_user(email, password, **extra_fields)


# Custom User modeli (database table)
class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)  # Login için email
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    nick_name = models.CharField(max_length=30, blank=True)
    birth_date = models.DateField(blank=True,null=True)
    max_streak = models.IntegerField(blank=True , default=0)
    translated_words = models.IntegerField(blank=True,default=0)
    saved_words = models.IntegerField(blank=True,default=0)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    USERNAME_FIELD = "email"  # Login alanı olarak email kullanılır
    REQUIRED_FIELDS = []  # Süperuser için zorunlu ekstra alan yok

    objects = CustomUserManager()  # Manager atandı

    def __str__(self):
        return self.email  # Admin panelinde ve shell’de kullanıcıyı email ile göster
