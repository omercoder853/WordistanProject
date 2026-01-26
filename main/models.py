from django.db import models
from django.conf import settings

class Dictionary(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)  
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
