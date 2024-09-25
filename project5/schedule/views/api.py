import json
from django.http import JsonResponse
from django.core import serializers
from django.core.exceptions import PermissionDenied

def newUser(request):
    if request.method != "POST":
        raise PermissionDenied()
    
    # Use a django form to validate

    # Build the user object

    # Save it

    # Return success or failure

def thisUser(request, userId):
    pass