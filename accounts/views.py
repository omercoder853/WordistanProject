from django.shortcuts import render,redirect
from django.contrib.auth import authenticate,login,logout,get_user_model
from django.contrib import messages
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from .serializers import RegisterSerializer

def login_page(request):
    return render(request,"accounts/login.html")

@api_view(["POST"])
def user_login(request):
    data = request.data
    user = authenticate(request,email=data['email'],password=data['password'])

    if user is not None:
        login(request,user)
        return Response({"message": "Login successful"}, status=status.HTTP_200_OK)
    else:
        return Response({"message": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
      
def logout_page(request):
    return render(request,"accounts/logout.html")

@api_view(["POST"])
def logout_user(request):
    logout(request)
    return Response({"message":"Logged out successfully!"},status=status.HTTP_200_OK)

def register(request):
    return render(request,'accounts/register.html')

@api_view(["POST"])
def user_register(request):
    data = request.data
    serializer = RegisterSerializer(data = data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message":"Welcome to Wordistan","user":serializer.data},status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




    