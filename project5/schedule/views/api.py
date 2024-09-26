import json
from django.http import JsonResponse, Http404
from django.core import serializers
from django.core.exceptions import PermissionDenied
from schedule.forms import NewSchedule
from schedule.models import Schedule

def newSchedule(request):
    if request.method != "POST":
        raise Http404
    # Validate 
    form = NewSchedule(request.Post)
    if form.is_valid():
        schedule = Schedule(
            name=form.cleaned_data['name']
        )
        try:
            schedule.save()
        except Exception as e:
            print(e)
            # Error saving
            return JsonResponse(serializers.serialize("json", {
                "schedule": schedule,
                "error": "Problem saving",
                "success": False
            }))
    else:
        # Form invalid
        return JsonResponse(serializers.serialize("json", {
            "schedule": request.Post,
            "error": form.errors,
            "success": False
        }))

def thisSchedule(request, scheduleId):
    pass