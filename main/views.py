from django.shortcuts import render, get_object_or_404
from django.http.response import HttpResponse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from .models import Dictionary
from .models import Words
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
        

@require_http_methods(["GET"])
def dictionaries_list(request):
    dictionaries = Dictionary.objects.filter(user = request.user).order_by('-created_at')
    # Dictionary'leri JSON formatına çevir
    dict_list = []
    for dictionary in dictionaries:
        dict_list.append({
            'id': dictionary.id,
            'name': dictionary.name,
            'description': dictionary.description,
            'language': dictionary.language,
            'created_at': dictionary.created_at.isoformat()
        })
    
    # Listeyi JSON olarak döndür
    return JsonResponse(dict_list, safe=False)

@csrf_exempt
@require_http_methods(["POST"])
def dictionaries_add(request):
    try:
        data = json.loads(request.body)
        name = data.get('name', '').strip()
        description = data.get('description', '').strip()
        language = data.get('language', 'TR to ENG')
        
        # Validasyon
        if not name:
            return JsonResponse({'error': 'Dictionary name is required'}, status=400)
        
        # Yeni sözlük oluştur (user opsiyonel)
        dictionary = Dictionary.objects.create(
            user=request.user,
            name=name,
            description=description if description else None,
            language=language
        )
        
        return JsonResponse({
            'id': dictionary.id,
            'name': dictionary.name,
            'description': dictionary.description,
            'language': dictionary.language,
            'created_at': dictionary.created_at.isoformat()
        }, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def dictionaries_delete(request, dict_id):
    try:
        # Sözlüğü bul ve sil
        dictionary = get_object_or_404(Dictionary, id=dict_id)
        dictionary.delete()
        return JsonResponse({'success': True}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

# ------------------------------------------------------------------------------------------
@csrf_exempt
@require_http_methods(["GET"])
def words_list(request,dict_id):
    try:
        words = Words.objects.filter(dictionary__id=dict_id).select_related('dictionary').order_by('-added_at')
        # { Sözlük_ID: { sozluk_bilgileri, kelimeler: [] } } formatında olacak
        if not words.exists():
            return JsonResponse({'error': 'Dictionary not found or empty'}, status=404)
        grouped_data = {}
        base_dictionary = words[0].dictionary
        grouped_data[dict_id] = {
            'dict_id':base_dictionary.id,
            'dict_name':base_dictionary.name,
            'dict_desc':base_dictionary.description,
            'language':base_dictionary.language,
            'words':[]
        }
        for word in words: 
            # Kelimeyi ilgili sözlüğün 'words' listesine ekle
            grouped_data[dict_id]['words'].append({
                'word_id': word.id,
                'word': word.word,
                'meaning': word.meaning,
                'added_at': word.added_at.isoformat()
            })

        # 3. Sonuç olarak, sözlüğün değerlerini (gruplanmış dictionary objelerini) listeye dönüştür
        final_list = list(grouped_data.values())

        return JsonResponse(final_list, safe=False, status=200)

    except Exception as e:
        # Hata ayıklama için terminale yazdır
        print(f"Hata oluştu: {e}") 
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def word_add(request):
    try:
        data = json.loads(request.body)
        dict_id = data.get('dict_id', '').strip()
        word = data.get('word', '').strip()
        meaning = data.get('meaning', '').strip()
        
        # Validasyon
        if not dict_id or not word or not meaning:
            return JsonResponse({'error': 'All fields must be filled.'}, status=400)
        
        try:
            target_dict = Dictionary.objects.get(id=dict_id)
        except Dictionary.DoesNotExist:
            return JsonResponse({'error': f'Dictionary with ID {dict_id} not found.'}, status=400)
        
        # Yeni kelime oluştur (user opsiyonel)
        word = Words.objects.create(
            dictionary= target_dict,
            word=word,
            meaning=meaning,
        )
        
        return JsonResponse({
            'id': word.id,
            'word': word.word,
            'meaning': word.meaning,
            'added_at': word.added_at.isoformat()
        }, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)