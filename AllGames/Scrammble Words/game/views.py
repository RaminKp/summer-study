from django.shortcuts import render, redirect
import random
from .models import GameResult
import logging
from django.http import HttpResponse
from gtts import gTTS
import io
from django.utils import timezone
import json

logger = logging.getLogger("game")

# --------------------------
# Word Lists and Descriptions
# --------------------------
EASY_WORDS = [
    'CAT', 'DOG', 'SUN', 'HAT', 'CAR', 'BEE', 'COW', 'PIG', 'EGG', 'CUP',
    'BOX', 'BUS', 'TOY', 'BED', 'BAT', 'FOX', 'OWL', 'ANT', 'MUD', 'SKY',
    'PEN', 'KEY', 'MAP', 'ZIP', 'RUG', 'ROCK', 'TREE', 'BIRD', 'FISH', 'BOAT',
    'DOOR', 'BALL', 'STAR', 'MOON', 'RAIN', 'SNOW', 'LEAF', 'WOLF', 'JUMP',
    'WALK', 'PLAY', 'STOP', 'OPEN', 'DESK', 'SHOE', 'COAT', 'MILK', 'SOUP',
    'FOOD', 'LOVE'
]
EASY_WORD_DESCRIPTIONS = {
    'CAT': 'A small, furry pet that purrs and loves to play.',
    'DOG': 'A friendly pet that loves to run and fetch.',
    'SUN': 'The bright star that lights up our day.',
    'HAT': 'A fun accessory you wear on your head.',
    'CAR': 'A small vehicle that takes you places.',
    'BEE': 'A busy insect that makes honey and buzzes among flowers.',
    'COW': 'A gentle farm animal that gives milk.',
    'PIG': 'A cute animal that loves to roll in the mud.',
    'EGG': 'A small, oval food that comes from chickens.',
    'CUP': 'A small container used for drinking.',
    'BOX': 'A container that holds your treasures or toys.',
    'BUS': 'A large vehicle that carries many people.',
    'TOY': 'A fun item that you play with.',
    'BED': 'A cozy place where you sleep and dream.',
    'BAT': 'A small animal that flies at night.',
    'FOX': 'A clever animal with a bushy tail.',
    'OWL': 'A wise bird that hoots at night.',
    'ANT': 'A tiny insect that works hard in a colony.',
    'MUD': 'Wet, soft soil that is fun to play in.',
    'SKY': 'The blue space above us filled with clouds.',
    'PEN': 'A tool used for writing your ideas.',
    'KEY': 'A small object that opens locks.',
    'MAP': 'A drawing that shows directions and places.',
    'ZIP': 'A fast move or a fastener on clothing.',
    'RUG': 'A soft piece of fabric placed on the floor.',
    'ROCK': 'A small, hard piece of earth you can find outside.',
    'TREE': 'A tall plant with branches and leaves.',
    'BIRD': 'A feathered creature that sings and flies.',
    'FISH': 'A water creature that swims gracefully.',
    'BOAT': 'A small vessel that sails on water.',
    'DOOR': 'An entrance that opens and closes.',
    'BALL': 'A round object used in games and sports.',
    'STAR': 'A tiny light that twinkles in the night sky.',
    'MOON': 'A round object that lights up the night.',
    'RAIN': 'Drops of water falling from the sky.',
    'SNOW': 'Fluffy white flakes that fall during winter.',
    'LEAF': 'A green, flat part of a plant.',
    'WOLF': 'A wild animal known for its keen senses.',
    'JUMP': 'To leap off the ground using your legs.',
    'WALK': 'To move on foot at a steady pace.',
    'PLAY': 'To have fun with toys or games.',
    'STOP': 'To cease moving or doing something.',
    'OPEN': 'To make something not closed.',
    'DESK': 'A piece of furniture where you can study or draw.',
    'SHOE': 'Footwear that protects your feet.',
    'COAT': 'A warm garment worn in cold weather.',
    'MILK': 'A healthy drink that comes from cows.',
    'SOUP': 'A warm, tasty liquid food.',
    'FOOD': 'Something you eat to give you energy and strength.',
    'LOVE': 'A warm feeling of care and happiness.'
}

# For Medium and Hard games, define similar lists and descriptions.
MEDIUM_WORDS = ['GAME', 'CODE', 'CLUB', 'HIKE', 'RACE', 'ZOOM', 'CHAT', 'SONG', 'TUNE']
MEDIUM_WORD_DESCRIPTIONS = {
    'GAME': 'A fun activity you play for enjoyment.',
    'CODE': 'A set of letters or numbers used to send secret messages.',
    'CLUB': 'A small group where friends gather.',
    'HIKE': 'A walk, usually in nature, for exercise.',
    'RACE': 'A competition to see who can move the fastest.',
    'ZOOM': 'To move quickly like a race car.',
    'CHAT': 'A friendly conversation between people.',
    'SONG': 'A piece of music with words that you sing.',
    'TUNE': 'A catchy melody to hum or sing along with.'
}
HARD_WORDS = ['APPLE', 'BRICK', 'PLANT', 'GRASS', 'BEACH', 'CLOUD', 'SPACE', 'MAGIC']
HARD_WORD_DESCRIPTIONS = {
    'APPLE': 'A juicy fruit that can be red, green, or yellow.',
    'BRICK': 'A solid block used to build structures.',
    'PLANT': 'A living green thing that grows in soil.',
    'GRASS': 'Green blades that cover the ground.',
    'BEACH': 'A sandy place by the ocean.',
    'CLOUD': 'A fluffy white shape floating in the sky.',
    'SPACE': 'The vast area beyond our planet.',
    'MAGIC': 'A mysterious power that seems to defy logic.'
}

# --------------------------
# Helper Function
# --------------------------
def scramble_word(word):
    if len(word) < 2 or len(set(word)) == 1:
        return word
    scrambled = word
    while scrambled == word:
        letters = list(word)
        random.shuffle(letters)
        scrambled = ''.join(letters)
    return scrambled

from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def log_event(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        logger.info("%s | %s | Player: %s | Event: %s",
                    timezone.now(), data.get('screen', 'Unknown Screen'),
                    data.get('player', 'Anonymous'), data.get('event', 'No event'))
        return HttpResponse(status=200)
    return HttpResponse(status=400)

def home(request):
    logger.info("%s | Home Page | Player: %s | Welcome message displayed",
                timezone.now(), request.session.get('player_name', 'Anonymous'))
    return render(request, 'game/home.html')

def options(request):
    player_name = request.GET.get('player_name', "").strip()
    if player_name:
        request.session['player_name'] = player_name
    logger.info("%s | Options Page | Player: %s | Options displayed",
                timezone.now(), request.session.get('player_name', 'Anonymous'))
    return render(request, 'game/options.html', {
        'player_name': request.session.get('player_name', 'Anonymous')
    })

def select_difficulty(request):
    player_name = request.session.get('player_name', 'Anonymous')
    keys_to_clear = ['attempts', 'correct_count', 'wrong_count', 'game_state', 'correct_word']
    for key in keys_to_clear:
        request.session.pop(key, None)
    logger.info("%s | Select Difficulty Page | Player: %s | Difficulty selection displayed",
                timezone.now(), player_name)
    return render(request, 'game/difficulty.html', {'player_name': player_name})

def game_rules(request):
    logger.info("%s | Game Rules Page | Player: %s | Game rules displayed",
                timezone.now(), request.session.get('player_name', 'Anonymous'))
    return render(request, 'game/gamerules.html')

def easy_game(request):
    if 'attempts' not in request.session:
        request.session['attempts'] = 0
        request.session['correct_count'] = 0
        request.session['wrong_count'] = 0
        request.session['game_state'] = 'START'

    if request.method == 'POST':
        correct_word = request.session.get('correct_word')
        user_guess = request.POST.get('guess', '').strip().upper()

        # Retrieve and convert trial start time from string to datetime.
        trial_start_str = request.session.get('trial_start_time')
        trial_duration = 0
        if trial_start_str:
            trial_start = timezone.datetime.fromisoformat(trial_start_str)
            trial_duration = (timezone.now() - trial_start).total_seconds()
        logger.info("%s | Easy Game | Player: %s | Trial Duration: %s sec",
                    timezone.now(), request.session.get('player_name', 'Anonymous'), trial_duration)

        if user_guess == correct_word:
            request.session['correct_count'] += 1
            result = "Correct! Well done."
            outcome = "CORRECT"
        else:
            request.session['wrong_count'] += 1
            result = f"Oops! The correct word was '{correct_word}'."
            outcome = "WRONG"

        request.session['attempts'] += 1

        logger.info("%s | Easy Game | Player: %s | Trial: %s | Outcome: %s | Score: %s",
                    timezone.now(), request.session.get('player_name', 'Anonymous'),
                    request.session.get('attempts', 0) + 1, outcome,
                    request.session.get('correct_count', 0))

        request.session['game_state'] = 'RESULT'

        if request.session['attempts'] >= 10:
            GameResult.objects.create(
                player_name=request.session.get('player_name', 'Anonymous'),
                difficulty="Easy",
                correct_count=request.session['correct_count'],
                wrong_count=request.session['wrong_count'],
                total_attempts=request.session['attempts']
            )
            logger.info("%s | Easy Game Over | Player: %s | Total Trials: %s | Correct: %s | Wrong: %s",
                        timezone.now(), request.session.get('player_name', 'Anonymous'),
                        request.session['attempts'], request.session['correct_count'], request.session['wrong_count'])
            return render(request, 'game/easy_game_over.html', {
                'correct_count': request.session['correct_count'],
                'wrong_count': request.session['wrong_count'],
                'game_state': request.session['game_state'],
                'player_name': request.session.get('player_name', 'Anonymous'),
                'user_guess': user_guess,
                'correct_word': correct_word
            })

        return render(request, 'game/easy.html', {
            'result': result,
            'user_guess': user_guess,
            'correct_word': correct_word,
            'game_state': request.session['game_state'],
            'player_name': request.session.get('player_name', 'Anonymous'),
            'correct_count': request.session.get('correct_count', 0),
            'wrong_count': request.session.get('wrong_count', 0)
        })

    else:
        # New round.
        word = random.choice(EASY_WORDS)
        scrambled = scramble_word(word)
        description = EASY_WORD_DESCRIPTIONS.get(word)
        request.session['correct_word'] = word

        # Store trial start time as an ISO formatted string.
        request.session['trial_start_time'] = timezone.now().isoformat()
        logger.info("%s | Easy Game | Player: %s | New Trial Started | Word: %s (scrambled: %s)",
                    timezone.now(), request.session.get('player_name', 'Anonymous'), word, scrambled)

        attempts = request.session.get('attempts', 0)
        attempts_left = 10 - attempts
        request.session['game_state'] = 'PLAYING'

        return render(request, 'game/game.html', {
            'scrambled': scrambled,
            'description': description,
            'attempts_left': attempts_left,
            'game_state': request.session['game_state'],
            'player_name': request.session.get('player_name', 'Anonymous')
        })


# Similar implementations can be added for medium_game and hard_game

def medium_game(request):
    # Initialize session variables if not present
    if 'attempts' not in request.session:
        request.session['attempts'] = 0
        request.session['correct_count'] = 0
        request.session['wrong_count'] = 0
        request.session['game_state'] = 'START'

    if request.method == 'POST':
        correct_word = request.session.get('correct_word')
        user_guess = request.POST.get('guess', '').strip().upper()

        # Retrieve trial start time and calculate duration
        trial_start_str = request.session.get('trial_start_time')
        trial_duration = 0
        if trial_start_str:
            trial_start = timezone.datetime.fromisoformat(trial_start_str)
            trial_duration = (timezone.now() - trial_start).total_seconds()
        logger.info("%s | Medium Game | Player: %s | Trial Duration: %s sec",
                    timezone.now(), request.session.get('player_name', 'Anonymous'), trial_duration)

        if user_guess == correct_word:
            request.session['correct_count'] += 1
            result = "Correct! Well done."
            outcome = "CORRECT"
        else:
            request.session['wrong_count'] += 1
            result = f"Oops! The correct word was '{correct_word}'."
            outcome = "WRONG"

        request.session['attempts'] += 1

        logger.info("%s | Medium Game | Player: %s | Trial: %s | Outcome: %s | Score: %s",
                    timezone.now(), request.session.get('player_name', 'Anonymous'),
                    request.session['attempts'] + 1, outcome,
                    request.session.get('correct_count', 0))

        request.session['game_state'] = 'RESULT'

        if request.session['attempts'] >= 10:
            GameResult.objects.create(
                player_name=request.session.get('player_name', 'Anonymous'),
                difficulty="Medium",
                correct_count=request.session['correct_count'],
                wrong_count=request.session['wrong_count'],
                total_attempts=request.session['attempts']
            )
            logger.info("%s | Medium Game Over | Player: %s | Total Trials: %s | Correct: %s | Wrong: %s",
                        timezone.now(), request.session.get('player_name', 'Anonymous'),
                        request.session['attempts'], request.session['correct_count'], request.session['wrong_count'])
            return render(request, 'game/medium_game_over.html', {
                'correct_count': request.session['correct_count'],
                'wrong_count': request.session['wrong_count'],
                'game_state': request.session['game_state'],
                'player_name': request.session.get('player_name', 'Anonymous'),
                'user_guess': user_guess,
                'correct_word': correct_word
            })

        return render(request, 'game/medium.html', {
            'result': result,
            'user_guess': user_guess,
            'correct_word': correct_word,
            'game_state': request.session['game_state'],
            'player_name': request.session.get('player_name', 'Anonymous'),
            'correct_count': request.session.get('correct_count', 0),
            'wrong_count': request.session.get('wrong_count', 0)
        })

    else:
        # New round: choose a random word from the medium list
        word = random.choice(MEDIUM_WORDS)
        scrambled = scramble_word(word)
        description = MEDIUM_WORD_DESCRIPTIONS.get(word)
        request.session['correct_word'] = word
        # Store trial start time as an ISO formatted string.
        request.session['trial_start_time'] = timezone.now().isoformat()
        logger.info("%s | Medium Game | Player: %s | New Trial Started | Word: %s (scrambled: %s)",
                    timezone.now(), request.session.get('player_name', 'Anonymous'), word, scrambled)
        attempts = request.session.get('attempts', 0)
        attempts_left = 10 - attempts
        request.session['game_state'] = 'PLAYING'
        return render(request, 'game/game.html', {
            'scrambled': scrambled,
            'description': description,
            'attempts_left': attempts_left,
            'game_state': request.session['game_state'],
            'player_name': request.session.get('player_name', 'Anonymous')
        })

def hard_game(request):
    # Initialize session variables if not present
    if 'attempts' not in request.session:
        request.session['attempts'] = 0
        request.session['correct_count'] = 0
        request.session['wrong_count'] = 0
        request.session['game_state'] = 'START'

    if request.method == 'POST':
        correct_word = request.session.get('correct_word')
        user_guess = request.POST.get('guess', '').strip().upper()

        # Retrieve trial start time and calculate duration
        trial_start_str = request.session.get('trial_start_time')
        trial_duration = 0
        if trial_start_str:
            trial_start = timezone.datetime.fromisoformat(trial_start_str)
            trial_duration = (timezone.now() - trial_start).total_seconds()
        logger.info("%s | Hard Game | Player: %s | Trial Duration: %s sec",
                    timezone.now(), request.session.get('player_name', 'Anonymous'), trial_duration)

        if user_guess == correct_word:
            request.session['correct_count'] += 1
            result = "Correct! Well done."
            outcome = "CORRECT"
        else:
            request.session['wrong_count'] += 1
            result = f"Oops! The correct word was '{correct_word}'."
            outcome = "WRONG"

        request.session['attempts'] += 1

        logger.info("%s | Hard Game | Player: %s | Trial: %s | Outcome: %s | Score: %s",
                    timezone.now(), request.session.get('player_name', 'Anonymous'),
                    request.session['attempts'] + 1, outcome,
                    request.session.get('correct_count', 0))

        request.session['game_state'] = 'RESULT'

        if request.session['attempts'] >= 10:
            GameResult.objects.create(
                player_name=request.session.get('player_name', 'Anonymous'),
                difficulty="Hard",
                correct_count=request.session['correct_count'],
                wrong_count=request.session['wrong_count'],
                total_attempts=request.session['attempts']
            )
            logger.info("%s | Hard Game Over | Player: %s | Total Trials: %s | Correct: %s | Wrong: %s",
                        timezone.now(), request.session.get('player_name', 'Anonymous'),
                        request.session['attempts'], request.session['correct_count'], request.session['wrong_count'])
            return render(request, 'game/hard_game_over.html', {
                'correct_count': request.session['correct_count'],
                'wrong_count': request.session['wrong_count'],
                'game_state': request.session['game_state'],
                'player_name': request.session.get('player_name', 'Anonymous'),
                'user_guess': user_guess,
                'correct_word': correct_word
            })

        return render(request, 'game/hard.html', {
            'result': result,
            'user_guess': user_guess,
            'correct_word': correct_word,
            'game_state': request.session['game_state'],
            'player_name': request.session.get('player_name', 'Anonymous'),
            'correct_count': request.session.get('correct_count', 0),
            'wrong_count': request.session.get('wrong_count', 0)
        })

    else:
        # New round: choose a random word from the hard list
        word = random.choice(HARD_WORDS)
        scrambled = scramble_word(word)
        description = HARD_WORD_DESCRIPTIONS.get(word)
        request.session['correct_word'] = word
        # Store trial start time as an ISO formatted string.
        request.session['trial_start_time'] = timezone.now().isoformat()
        logger.info("%s | Hard Game | Player: %s | New Trial Started | Word: %s (scrambled: %s)",
                    timezone.now(), request.session.get('player_name', 'Anonymous'), word, scrambled)
        attempts = request.session.get('attempts', 0)
        attempts_left = 10 - attempts
        request.session['game_state'] = 'PLAYING'
        return render(request, 'game/game.html', {
            'scrambled': scrambled,
            'description': description,
            'attempts_left': attempts_left,
            'game_state': request.session['game_state'],
            'player_name': request.session.get('player_name', 'Anonymous')
        })

def exit(request):
    return render(request, "Exit")

def restart_easy(request):
    for key in ['attempts', 'correct_count', 'wrong_count', 'game_state', 'correct_word']:
        request.session.pop(key, None)
    logger.info("%s | Restart Easy Game | Player: %s | Game restarted",
                timezone.now(), request.session.get('player_name', 'Anonymous'))
    return redirect('easy_game')

def restart_medium(request):
    for key in ['attempts', 'correct_count', 'wrong_count', 'game_state', 'correct_word']:
        request.session.pop(key, None)
    logger.info("%s | Restart Medium Game | Player: %s | Game restarted",
                timezone.now(), request.session.get('player_name', 'Anonymous'))
    return redirect('medium_game')

def restart_hard(request):
    for key in ['attempts', 'correct_count', 'wrong_count', 'game_state', 'correct_word']:
        request.session.pop(key, None)
    logger.info("%s | Restart Hard Game | Player: %s | Game restarted",
                timezone.now(), request.session.get('player_name', 'Anonymous'))
    return redirect('hard_game')

def tts(request):
    text = request.GET.get("text", "")
    if not text:
        return HttpResponse("No text provided", status=400)
    logger.info("%s | Voice Agent | Player: %s | Message: %s",
                timezone.now(), request.session.get('player_name', 'Anonymous'), text)
    tts_instance = gTTS(text, lang='en', slow=False)
    audio_data = io.BytesIO()
    tts_instance.write_to_fp(audio_data)
    audio_data.seek(0)
    response = HttpResponse(audio_data.read(), content_type="audio/mpeg")
    response["Content-Disposition"] = "inline; filename=tts.mp3"
    return response
