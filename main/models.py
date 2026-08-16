from django.db import models
from django.conf import settings
from django.dispatch import receiver
from django.db.models.signals import post_save

class Dictionary(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,related_name="dictionaries")  
    name = models.CharField(max_length=30)  
    description = models.TextField(max_length=100, null=True, blank=True)
    language = models.CharField(max_length=20, default='TR to ENG') 
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        user_identifier = self.user.email if self.user else "Anonymous"
        return f"{self.name} ({user_identifier})"


class Words(models.Model):
    dictionary = models.ForeignKey(Dictionary, on_delete=models.CASCADE, related_name="words")
    word = models.CharField(max_length=20)
    meaning = models.CharField(max_length=20)
    added_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.word} - {self.meaning}"

class Achievements(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE, related_name="achievements")
    achievementId = models.CharField(max_length=50)
    earned_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ('user' , 'achievementId')

class GameSession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="game_sessions")
    score = models.IntegerField()
    game_mode = models.CharField(max_length=50)
    correct_count = models.IntegerField()
    wrong_count = models.IntegerField()
    played_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.score} Puan"

class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
    total_xp = models.IntegerField(default=0)
    current_streak = models.IntegerField(default=0)
    last_active_date = models.DateField(null=True, blank=True)
    level = models.IntegerField(default=1)
    max_streak = models.IntegerField(blank=True , default=0)
    translated_words = models.IntegerField(blank=True,default=0)
    saved_words = models.IntegerField(blank=True,default=0)

    def __str__(self):
        return f"{self.user.email} Profili"

# --- SİNYALLER BURADAN BAŞLIYOR ---

@receiver(post_save, sender=settings.AUTH_USER_MODEL) # CustomUser yerine settings kullanmak daha sağlamdır
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'profile'):
        instance.profile.save()
