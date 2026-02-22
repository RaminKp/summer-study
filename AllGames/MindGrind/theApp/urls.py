from django.urls import path
from . import views

urlpatterns = [
    path("", views.Intro, name='Intro'),
    path("mindGrind", views.start_game, name='start_game'),
    path('reset_game/', views.reset_game, name='reset_game'),
    path('mindGrind/log/submitAnswer', views.submitAnswer, name='submitAnswer'),
    path('log/button-press/', views.log_button_press, name='log_button_press'),
]