from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('submit_quiz/', views.submit_quiz, name='submit_quiz'),
    path('log_event/', views.log_event, name='log_event'),
]