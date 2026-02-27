from rest_framework import serializers
from .models import Dictionary
from .models import Words

class WordsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Words
        fields = "__all__"
        read_only_fields = ['dictionary']

class DictionarySerializer(serializers.ModelSerializer):
    words = WordsSerializer(many = True , read_only = True)
    class Meta:
        model = Dictionary
        fields = "__all__"
        read_only_fields = ['user']
