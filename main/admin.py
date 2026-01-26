from django.contrib import admin
from .models import Dictionary, Words

# Register your models here.
@admin.register(Dictionary)
class DictionaryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description', 'language', 'user', 'created_at')
    list_filter = ('language', 'created_at')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at',)

@admin.register(Words)
class WordAdmin(admin.ModelAdmin):
    list_display = ('id', 'word', 'meaning', 'dictionary', 'added_at')
    list_filter = ('added_at', 'dictionary')
    search_fields = ('word', 'meaning')
    readonly_fields = ('added_at',)
