from django.contrib import admin
from .models import *

# Register your models here.
class UserAdmin(admin.ModelAdmin):
    pass

class ScheduleAdmin(admin.ModelAdmin):
    pass

class ShiftAdmin(admin.ModelAdmin):
    pass


admin.site.register(User, UserAdmin)
admin.site.register(Schedule, ScheduleAdmin)
admin.site.register(Shift, ShiftAdmin)