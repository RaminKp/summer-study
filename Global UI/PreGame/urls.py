from django.urls import path
from . import views

urlpatterns = [
    path('', views.start_page, name='start_page'),
    path('games/', views.games_page, name='games_page'),
    path('play/<str:game_name>/', views.play_game, name='play_game'),
    path('scan/', views.scan_page, name='scan_page'),
    path('check_marker/', views.check_marker, name='check_marker'),
    path('video_feed/', views.video_feed, name='video_feed'),
]