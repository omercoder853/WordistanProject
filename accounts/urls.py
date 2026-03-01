from . import views
from django.urls import path
from rest_framework_simplejwt.views import (TokenVerifyView,TokenRefreshView)
from .views import MyTokenObtainView

#http://127.0.0.1:8000/login                             => login.html
#http://127.0.0.1:8000/logout                            => logout.html
#http://127.0.0.1:8000/register                          => register.html

urlpatterns = [
    path("login",views.login_page, name="login"),
    path("logout",views.logout_page,name="logout"),
    path("register",views.register,name="register"),
    #---------------------------
    path("api/login",views.user_login,name="user_login"),
    path("api/logout",views.logout_user,name="user_logout"),
    path("api/register",views.user_register,name="user_register"),
    #------------------------
    path("api/token",MyTokenObtainView.as_view(),name="token"),
    path("api/token/verify",TokenVerifyView.as_view(),name="token_verify"),
    path("api/token/refresh",TokenRefreshView.as_view(),name="token_refresh")
]