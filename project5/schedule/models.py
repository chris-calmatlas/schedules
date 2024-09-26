from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.
class User(AbstractUser):
    pass

class Schedule(models.Model):
    name = models.CharField(max_length=64),
    owner = models.ForeignKey("User", null=True, on_delete=models.CASCADE, related_name="schedules"),
    createdOn = models.DateTimeField(auto_now_add=True),
    modifiedOn = models.DateTimeField(auto_now=True)
    startDate = models.DateField()
    endDate = models.DateField()
   
class Shift(models.Model):
    schedule = models.ForeignKey("Schedule", on_delete=models.CASCADE, related_name="shifts")
    userNickname = models.CharField(max_length=64),
    user = models.ForeignKey("User", null=True, on_delete=models.CASCADE, related_name="schedules"),
    owner = models.ForeignKey("User", on_delete=models.CASCADE, related_name="schedules"),
    startTime = models.DateTimeField(),
    endTime = models.DateTimeField()