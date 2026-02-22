from django.shortcuts import render, redirect
from .forms import PlayerForm
from .models import Player, Score, LogEntry  # Ensure LogEntry is imported

def log_page_load(request, page_name, event="Page Loaded"):
    """
    Helper function to log page load events.
    It retrieves the player name from the session (or defaults to 'Guest')
    and creates a log entry with the provided page name and event.
    """
    player_name = "Guest"
    player_id = request.session.get("player_id")
    if player_id:
        try:
            player = Player.objects.get(id=player_id)
            player_name = player.name
        except Player.DoesNotExist:
            player_name = "Guest"
    LogEntry.objects.create(page=page_name, player=player_name, event=event)

def home(request):
    log_page_load(request, "Home Page")
    return render(request, 'home.html')

def play(request):
    player_name = "Player"
    player_id = request.session.get("player_id")
    if player_id:
        try:
            player = Player.objects.get(id=player_id)
            player_name = player.name
        except Player.DoesNotExist:
            pass
    log_page_load(request, "Play Page", f"Player: {player_name} loaded play page")
    return render(request, 'play.html', {'player_name': player_name})

def firstaid(request):
    log_page_load(request, "First Aid Page")
    return render(request, 'firstaid.html')

def knee_game(request):
    log_page_load(request, "Knee Game Page")
    return render(request, 'knee_game.html')

def fever_game(request):
    log_page_load(request, "Fever Game Page")
    return render(request, 'fever_game.html')

def burn_game(request):
    log_page_load(request, "Burn Game Page")
    return render(request, 'burn_game.html')

def set_player(request):
    name = request.GET.get("name", "Player")
    player = Player.objects.create(name=name)
    request.session['player_id'] = player.id
    LogEntry.objects.create(page="Set Player", player=player.name, event=f"Player set with name: {name}")
    return redirect('play')

def record_score(request):
    if request.method == 'POST':
        player_id = request.session.get("player_id")
        if not player_id:
            player = Player.objects.create(name="Guest")
            request.session['player_id'] = player.id
        else:
            try:
                player = Player.objects.get(id=player_id)
            except Player.DoesNotExist:
                player = Player.objects.create(name="Guest")
                request.session['player_id'] = player.id

        level = request.POST.get('level', 'unknown')
        try:
            score_value = int(request.POST.get('score', 0))
        except ValueError:
            score_value = 0

        Score.objects.create(player=player, level=level, score=score_value)
        LogEntry.objects.create(page="Record Score", player=player.name, event=f"Recorded score for level {level}: {score_value}")
        return redirect('scoreboard')
    else:
        return redirect('play')

def scoreboard_all(request):
    knee_scores = Score.objects.filter(level="knee_game").order_by('-score', '-created')
    fever_scores = Score.objects.filter(level="fever_game").order_by('-score', '-created')
    burn_scores = Score.objects.filter(level="burn_game").order_by('-score', '-created')
    log_page_load(request, "Scoreboard All", "Viewed all scores")
    return render(request, 'scoreboard_all.html', {
        'knee_scores': knee_scores,
        'fever_scores': fever_scores,
        'burn_scores': burn_scores,
    })

def scoreboard(request):
    player_id = request.session.get("player_id")
    current_score = None
    if player_id:
        current_score = Score.objects.filter(player_id=player_id).order_by('-created').first()
    log_page_load(request, "Scoreboard", "Viewed current player's score")
    return render(request, 'scoreboard.html', {'score': current_score})

# ✅ Clear all players' scores (admin reset)
def clear_player_scores(request):
    if request.method == 'POST':
        Score.objects.all().delete()  # Delete all scores
        LogEntry.objects.create(page="Clear Scores", player="Admin", event="All scores cleared")
    return redirect('scoreboard_all')  # Go back to full scoreboard view

def tutorial_view(request):
    log_page_load(request, "Tutorial Page")
    return render(request, 'tutorial.html')


# -------------------------------
# New Logging Endpoints
# -------------------------------
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def log_event(request):
    """
    Accepts POST requests with JSON log data.
    Expected keys: timestamp, page, player, event.
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            LogEntry.objects.create(
                page=data.get("page", ""),
                player=data.get("player", ""),
                event=data.get("event", "")
            )
            return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    else:
        return JsonResponse({'status': 'error', 'message': 'Only POST requests are allowed.'}, status=400)

def log_debug(request):
    """
    Renders a debug page displaying all log entries.
    """
    logs = LogEntry.objects.all().order_by('-timestamp')
    return render(request, 'log_debug.html', {'logs': logs})
