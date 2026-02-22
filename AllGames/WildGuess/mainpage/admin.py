from django.contrib import admin
from .models import ButtonPressLog
from .models import score

# Register your models here.
admin.site.register(ButtonPressLog)
admin.site.register(score)