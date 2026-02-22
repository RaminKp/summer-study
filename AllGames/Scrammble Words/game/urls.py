from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('options/', views.options, name='options'),
    path('select_difficulty/', views.select_difficulty, name='select_difficulty'),
    path('game_rules/', views.game_rules, name='game_rules'),
    path('exit/', views.exit, name='exit'),
    path('easy_game/', views.easy_game, name='easy_game'),
    path('rules/', views.game_rules, name='rules'),
    path('medium_game/', views.medium_game, name='medium_game'),
    path('hard_game/', views.hard_game, name='hard_game'),
    path('restart/easy/', views.restart_easy, name='restart_easy'),
    path('restart/medium/', views.restart_medium, name='restart_medium'),
    path('restart/hard/', views.restart_hard, name='restart_hard'),
    # New TTS endpoint:
    path('tts/', views.tts, name='tts'),
    path('log-event/', views.log_event, name='log_event'),
]
