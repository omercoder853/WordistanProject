from django.urls import path
from . import views
#http://127.0.0.1:8000/                             => index.html
#http://127.0.0.1:8000/index                        => index.html
#http://127.0.0.1:8000/translate                    => translate.html
#http://127.0.0.1:8000/dictionaries                 => dictionaries.html
#http://127.0.0.1:8000/games                        => games.hthml
#http://127.0.0.1:8000/dict-details-dict_id         => dict_details.html
#http://127.0.0.1:8000/collections                  => collections.html
#http://127.0.0.1:8000/collection-details-coll_name                  => collections_details.html
#http://127.0.0.1:8000/game_start                   => starting_game.html



urlpatterns = [
    path("",views.index,name="home"),
    path("index",views.index,name="home"),
    path("translate",views.translate,name="translate"),
    path("dictionaries",views.dictionaries,name="dictionaries"),
    path("games",views.games,name='games'),
    path("dict-details/<int:dict_id>",views.dict_details,name="dict_details"),
    path("collections",views.collections,name="collections"),
    path("collection-details/<str:coll_name>",views.collection_details,name="collection_details"),
    path("game_start/game_type=<str:game_type>/",views.game_start,name="game_start"),
    path("profile/",views.profile , name="profile"),
    # API endpoints for dictionaries
    path("api/dictionaries/", views.dictionaries_list, name="dictionaries_list"),
    path("api/dictionaries/add/", views.dictionaries_add, name="dictionaries_add"),
    path("api/dictionaries/<int:dict_id>/delete/", views.dictionaries_delete, name="dictionaries_delete"),
    # API endpoints for words
    path("api/words/dict_id-<int:dict_id>",views.words_list,name="word_list"),
    path("api/words/add/",views.word_add,name="word_add")
]