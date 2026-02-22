from django.urls import path
from . import views #represents the current directory
from .views import log_button_press

urlpatterns = [
    path("", views.start, name='start'),
    path("1/", views.penguin, name='penguin'),
    path("2/", views.giraffe, name='giraffe'),
    path("3/", views.wolf, name='wolf'),
    path("4/", views.ant, name='ant'),
    path('log/button-press/', log_button_press, name='log_button_press'),
    path('1/log/score/', views.log_score, name='log_score1'),
    path('2/log/score/', views.log_score, name='log_score2'),
    path('3/log/score/', views.log_score, name='log_score3'),
    path('4/log/score/', views.log_score, name='log_score4'),
]
