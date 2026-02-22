from django.shortcuts import render
from django.http import JsonResponse
from .models import QuizResult, GameLog
from django.utils.dateparse import parse_datetime
from django.utils.timezone import now
import json

def index(request):
    return render(request, 'ocean_explore/index.html')

def submit_quiz(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        user_name = data.get('user_name', 'Anonymous')
        score = data.get('score', 0)
        QuizResult.objects.create(user_name=user_name, score=score)
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'fail'}, status=400)

def log_event(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        GameLog.objects.create(
            timestamp=parse_datetime(str(data.get('timestamp'))) or now(),
            screen=data.get('screen', ''),
            player=data.get('player', ''),
            trial_number=data.get('trial', None),
            voice_text=data.get('voice', ''),
            button_clicked=data.get('action', ''),
            score=data.get('score', 0),
            total_trials=data.get('totalTrials', 0),
            correct_trials=data.get('correct', 0),
            incorrect_trials=data.get('incorrect', 0),
            hints_used=data.get('hints', 0),
            duration=data.get('duration', 0)
        )
        return JsonResponse({'status': 'logged'})

    return JsonResponse({'status': 'error'}, status=400)