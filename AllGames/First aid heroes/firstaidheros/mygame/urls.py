from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('play/', views.play, name='play'),
    path('set_player/', views.set_player, name='set_player'),
    path('firstaid/', views.firstaid, name='firstaid'),
    path('knee-game/', views.knee_game, name='knee_game'),
    path('fever-game/', views.fever_game, name='fever_game'),
    path('burn-game/', views.burn_game, name='burn_game'),
    path('record_score/', views.record_score, name='record_score'),
    path('scoreboard/', views.scoreboard, name='scoreboard'),              # Current player's score
    path('scoreboard_all/', views.scoreboard_all, name='scoreboard_all'),  # All scores
    path('clear_scores/', views.clear_player_scores, name='clear_scores'), # Clear all scores
    path('tutorial/', views.tutorial_view, name='tutorial'),
    # New endpoints for logging:
    path('log_event/', views.log_event, name='log_event'),
    path('debug/logs/', views.log_debug, name='log_debug'),
]
