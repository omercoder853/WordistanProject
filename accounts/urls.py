from . import views
from django.urls import path

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
    path("api/register",views.user_register,name="user_register")
]