from . import views
from django.urls import path

#http://127.0.0.1:8000/login                             => login.html
#http://127.0.0.1:8000/logout                            => logout.html
#http://127.0.0.1:8000/register                          => register.html

urlpatterns = [
    path("login",views.login_page, name="login"),
    path("logout",views.logout_user,name="logout"),
    path("register",views.register,name="register")
]