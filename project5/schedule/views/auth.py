from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.shortcuts import render, redirect
from schedule.models import User
from schedule.forms import RegisterUser, LoginUser

def login_view(request):
    if request.method == "POST":
        form = LoginUser(request.POST)
        if form.is_valid():
            # Attempt to sign user in
            username = form.cleaned_data["username"]
            password = form.cleaned_data["password"]
            user = authenticate(request, username=username, password=password)

            # Check if authentication successful
            if user is not None:
                login(request, user)
                return redirect("index")
            else:
                return render(request, "schedule/auth/login.html", {
                    "message": "Invalid username and/or password.",
                    "loginForm": LoginUser()
                })
        else:
            return render(request, "schedule/auth/login.html", {
                "message": "Something was wrong with the form",
                "loginForm": LoginUser()
            })
    else:
        return render(request, "schedule/auth/login.html", { "loginForm": LoginUser()})

def logout_view(request):
    logout(request)
    return redirect("index")

def register(request):
    if request.method == "POST":

        form = RegisterUser(request.POST)
        if form.is_valid():
            username = form.cleaned_data["username"]
            email = form.cleaned_data["email"]

            # Ensure password matches confirmation
            password = form.cleaned_data["password"]
            confirmation = form.cleaned_data["confirmation"]
            if password != confirmation:
                return render(request, "schedule/auth/register.html", {
                    "message": "Passwords must match.",
                    "registerForm": RegisterUser(request.POST)
                })

            # Attempt to create new user
            try:
                user = User.objects.create_user(username, email, password)
                user.save()
            except IntegrityError:
                return render(request, "schedule/auth/register.html", {
                    "message": "Username already taken.",
                    "registerForm": RegisterUser(request.POST)
                })
            return redirect("login")
        else:
            return render(request, "schedule/auth/register.html", {
                "message": "Something was wrong with the form"
            })
    else:
        return render(request, "schedule/auth/register.html", {"registerForm": RegisterUser()})

