from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import F
from .models import Dictionary,Achievements,Profile
from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .serializer import DictionarySerializer,WordsSerializer,ProfileStatsSerializer
# Create your views here.

def index(request):
    return render(request,"translate/homepage.html")

def translate(request):
    return render(request,"translate/translate.html")

def dictionaries(request):
    return render(request,'translate/dictionaries.html')

def games(request):
    return render(request,"translate/games.html")

def dict_details(request,dict_id):
    return render(request,"translate/dict_details.html",{'dict_id':dict_id})

def collections(request):
    return render(request,"translate/collections.html")

def collection_details(request,coll_name):
    return render(request,"translate/collection_details.html",{'coll_name':coll_name})

def profile(request):
    return render(request,"translate/profile.html")

def game_start(request,game_type):
    match game_type:
        case "mcq":
            return render(request,"translate/mcq_game_start.html",{'game_type':game_type})
        case "wc":
            return render(request,"translate/wc_game_start.html",{'game_type':game_type})
        case "mp":
            return render(request,"translate/mp_game_start.html",{'game_type':game_type})

#User Profile Stats -----------------------------------------------------
@api_view(["GET"])
def user_stats(request):
    profile_stats = get_object_or_404(Profile,user=request.user)
    serializer = ProfileStatsSerializer(profile_stats)
    return Response(serializer.data,status=status.HTTP_200_OK)

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_user_stats(request):
    pending_data = request.data
    profile = request.user.profile
    try:
        if "translated" in pending_data and pending_data["translated"]!=0:
            profile.translated_words = F('translated_words') + int(pending_data['translated'])
        if "saved" in pending_data and pending_data["saved"]!=0:
            profile.saved_words = F('saved_words') + int(pending_data['saved'])
        if "xp" in pending_data and pending_data["xp"]!=0:
            profile.total_xp = F('total_xp') + int(pending_data['xp'])
        profile.save()
        profile.refresh_from_db()
        serializer = ProfileStatsSerializer(profile)
        return Response(serializer.data,status=status.HTTP_200_OK)
    except:
        return Response({"error": "Invalid Data Format!"}, status=status.HTTP_400_BAD_REQUEST)
        
#Dictionary Operations ---------------------------------------------------

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dictionaries_list(request):
    dictionaries = Dictionary.objects.filter(user = request.user).order_by('-created_at')
    serializer = DictionarySerializer(dictionaries, many = True)
    return Response(serializer.data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def dictionaries_add(request):
    serializer = DictionarySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def dictionaries_delete(request, dict_id):
    dictionary = get_object_or_404(Dictionary, pk=dict_id)
    if dictionary.user != request.user:
        return Response({"error":"You are not allowed for this operation"},status=status.HTTP_403_FORBIDDEN)
    dictionary.delete()
    return Response({"message":"The deleting is successfull!"},status=status.HTTP_204_NO_CONTENT)

# ------------------------------------------------------------------------------------------
@csrf_exempt
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def words_list(request,dict_id):
    dictionary = get_object_or_404(Dictionary,pk=dict_id)
    serializer = DictionarySerializer(dictionary)
    return Response(serializer.data)

@csrf_exempt
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def word_add(request,dict_id):
    dictionary = get_object_or_404(Dictionary,pk=dict_id)
    if dictionary.user != request.user:
        return Response({"error":"You are not allowed for this operation"},status=status.HTTP_403_FORBIDDEN)
    serializer = WordsSerializer(data=request.data,partial = True)
    if serializer.is_valid():
        serializer.save(dictionary = dictionary)
        return Response(serializer.data)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
#-----------------------------------------------

def wordTranslated(request):
    request.user.translated_words += 1
    request.user.save(update_fields=['translated_words'])
    current_translated_words = request.user.translated_words
    new_badge = None
    if current_translated_words == 2:
        obj , created = Achievements.objects.get_or_create(user = request.user , achievementId = 'translator_1')
        if created:
            new_badge = "Translator 1"
    elif current_translated_words == 5:
        obj , created = Achievements.objects.get_or_create(user = request.user , achievementId = 'translator_2')
        if created:
            new_badge = "Translator 2"
    return JsonResponse({"new_achievement" : new_badge})

def earnedAchievements(request):
    user = request.user
    earned_achievements = list(Achievements.objects.filter(user=user).values_list('achievementId',flat=True))
    return JsonResponse({"earned_achievements": earned_achievements})

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def newAchievement(request):
    ACHIEVEMENT_RULES = {
    "translator_1": {"field": "translated_words", "value": 10},
    "translator_2": {"field": "translated_words", "value": 25},
    "librarian_1": {"field": "saved_words", "value": 10},
    "archivist_1": {"field": "created_lists", "value": 3},
    "archivist_2": {"field": "created_lists", "value": 10},
    "curious_novice": {"field": "max_streak", "value": 3},
    "eager_learner": {"field": "max_streak", "value": 7},
    "word_hunter": {"field": "max_streak", "value": 15},
    "lexicon_scholar": {"field": "max_streak", "value": 30},
    "word_master": {"field": "max_streak", "value": 60}}

    ach_id = request.data.get('achievementId')
    profile = request.user.profile
    if not ach_id or ach_id not in ACHIEVEMENT_RULES:
        return Response({"error": "Geçersiz veya eksik Başarım ID!"}, status=status.HTTP_400_BAD_REQUEST)

    rule = ACHIEVEMENT_RULES[ach_id]
    user_value = getattr(profile, rule['field'], 0)
    
    created = False
    if user_value >= rule['value']:
        obj, created = Achievements.objects.get_or_create(
            user=request.user, 
            achievementId=ach_id)
    else:
        return Response({"error": "Bu başarım için gereken şartlar henüz sağlanmadı!"}, status=status.HTTP_403_FORBIDDEN)

    updated_achievements = list(request.user.achievements.all().values('achievementId', 'earned_at'))

    if created:
        return Response({"updated_achievements":updated_achievements}, status=status.HTTP_201_CREATED)
    else:
        return Response({"message": "Bu başarım zaten kazanılmış.","updated_achievements":updated_achievements}, status=status.HTTP_200_OK)

def wordSaved(request):
    request.user.saved_words +=1
    request.user.save(update_fields = ['saved_words'])
    current_saved_words = request.user.saved_words
    new_badge = None
    if current_saved_words == 2:
        obj , created = Achievements.objects.get_or_create(user = request.user , achievementId = 'archivist_1')
        if created:
            new_badge = "archivist_1"
    elif current_saved_words==5:
        obj , created = Achievements.objects.get_or_create(user = request.user , achievementId = 'archivist_2')
        if created:
            new_badge = "archivist_2"
    return JsonResponse({"new_achievement" : new_badge}) 

#-----------------------------------------------------------------
