from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from .models import Dictionary
from .models import Words
from .models import Achivements
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializer import DictionarySerializer,WordsSerializer
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
        
#Dictionary Operations ---------------------------------------------------

@api_view(["GET"])
def dictionaries_list(request):
    dictionaries = Dictionary.objects.filter(user = request.user).order_by('-created_at')
    serializer = DictionarySerializer(dictionaries, many = True)
    return Response(serializer.data)

@api_view(["POST"])
def dictionaries_add(request):
    serializer = DictionarySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["DELETE"])
def dictionaries_delete(request, dict_id):
    dictionary = get_object_or_404(Dictionary, pk=dict_id)
    if dictionary.user != request.user:
        return Response({"error":"You are not allowed for this operation"},status=status.HTTP_403_FORBIDDEN)
    dictionary.delete()
    return Response({"message":"The deleting is successfull!"},status=status.HTTP_204_NO_CONTENT)

# ------------------------------------------------------------------------------------------
@csrf_exempt
@api_view(["GET"])
def words_list(request,dict_id):
    dictionary = get_object_or_404(Dictionary,pk=dict_id)
    serializer = DictionarySerializer(dictionary)
    return Response(serializer.data)

@csrf_exempt
@api_view(["PATCH"])
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
        obj , created = Achivements.objects.get_or_create(user = request.user , achivementId = 'translator_1')
        if created:
            new_badge = "Translator 1"
    elif current_translated_words == 5:
        obj , created = Achivements.objects.get_or_create(user = request.user , achivementId = 'translator_2')
        if created:
            new_badge = "Translator 2"
    return JsonResponse({"new_achivement" : new_badge})

def earnedAchivements(request):
    user = request.user
    earned_achievements = list(Achivements.objects.filter(user=user).values_list('achivementId',flat=True))
    return JsonResponse({"earned_achievements": earned_achievements})

def wordSaved(request):
    request.user.saved_words +=1
    request.user.save(update_fields = ['saved_words'])
    current_saved_words = request.user.saved_words
    new_badge = None
    if current_saved_words == 2:
        obj , created = Achivements.objects.get_or_create(user = request.user , achivementId = 'archivist_1')
        if created:
            new_badge = "archivist_1"
    elif current_saved_words==5:
        obj , created = Achivements.objects.get_or_create(user = request.user , achivementId = 'archivist_2')
        if created:
            new_badge = "archivist_2"
    return JsonResponse({"new_achivement" : new_badge}) 

#-----------------------------------------------------------------
