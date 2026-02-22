from django.contrib import admin
from .models import Question
from .models import playerScore
from .models import ButtonPressLog

# Register your models here.
admin.site.register(Question)
admin.site.register(playerScore)
admin.site.register(ButtonPressLog)