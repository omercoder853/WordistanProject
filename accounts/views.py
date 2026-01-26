from django.shortcuts import render,redirect
from django.contrib.auth import authenticate,login,logout,get_user_model
from django.contrib import messages


def login_page(request):
    if request.method == "GET":
        return render(request,"accounts/login.html")
    if request.method == "POST":
        email = request.POST.get("email")
        password = request.POST.get("password")
        user = authenticate(request,email=email,password=password)

        if user is not None:
            login(request,user)
            messages.success(request,"Welcome!!")
            return redirect("home")
        else:
            messages.error(request,"E-mail or password wrong!")
            return render(request,"accounts/login.html")
        
def logout_user(request):
    logout(request)
    return render(request,"accounts/logout.html")

User = get_user_model()
def register(request):
    if request.method == "GET":
        return render(request,'accounts/register.html')
    if request.method == 'POST':
        email = request.POST.get("email")
        first_name = request.POST.get("first_name")
        last_name = request.POST.get("last_name")
        nick_name = request.POST.get("nick_name")
        birthday = request.POST.get("birthday")
        password1 = request.POST.get("password1")
        password2 = request.POST.get("password2")

        if User.objects.filter(email=email).exists():
            messages.error(request,"This email has already had an account!")
            return redirect("register")
        if len(password1)<6:
            messages.error(request,"The password must have at least 6 characters!")
            return redirect("register")
        if password1 != password2:
            messages.error(request,"Passwords are not the same!")
            return redirect("register")
        if not birthday:
            messages.error(request,"Birthday is required")
            return redirect("register")
        
        user = User.objects.create_user(
            email=email,
            password=password1,
            first_name = first_name,
            last_name = last_name,
            birth_date = birthday,
            nick_name = nick_name if nick_name else ""
        )
        return redirect("login")



    