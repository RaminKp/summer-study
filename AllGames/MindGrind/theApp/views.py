from django.shortcuts import render, get_object_or_404, redirect
from .models import Question
import threading
import pyttsx3
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from .models import ButtonPressLog
from .models import playerScore

# The playerScore object associated with the current instance of the game
activePlayerScore = None

# Initializes text to speach
engine = pyttsx3.init()
engine.setProperty('rate', 135)
engine.setProperty('volume', 0.9)


def speak_text(text):
  global engine
  if(engine._inLoop):
    engine.endLoop()
  engine.say(text)
  engine.startLoop()

@csrf_exempt
# Create your views here.
def Intro(request):

  # Clear previous session data
  request.session.flush()

  if request.method == "POST":
    player1 = request.POST.get("player1")
    player2 = request.POST.get("player2")
    print("anything")

    #store in session
    request.session['player1'] = player1
    request.session['player2'] = player2

    global activePlayerScore
    activePlayerScore = playerScore.objects.create(player1name=player1, player2name=player2)

    return redirect("start_game") # Redirect to the main game page



  threading.Thread(target=speak_text, args=("Welcome to MindGrind. A fun educational trivia where you can learn about Geography and Science. Here's how it works: When you click on Start Button, You'll see and hear a question. The first player to press the button gets the opportunity to answer. If they answer correctly, they earn a point. If they get it wrong, we move to the next question. Please enter your Names in the boxes below and then click on Start Button",)).start()

  return render (request, 'intro.html', context={
  })


def fetch_trivia_questions():
  url = "https://opentdb.com/api.php?amount=20&category=22&difficulty=easy&type=multiple"
  response = requests.get(url)
  
  if response.status_code == 200:
    data = response.json()
    for item in data.get('results', []):
        Question.objects.update_or_create(
            text=item['question'],
            defaults={
                'correct_answer': item['correct_answer'],
                'incorrect_answers': item['incorrect_answers'],
                'category': item['category'],
                'difficulty': item['difficulty'],
            }
        )


@csrf_exempt
def start_game(request):

  player1 = request.session.get("player1","Player1") # the second value is Default if not found
  player2 = request.session.get("player2","Player2")


  #teporary solution to reload problem
  if 'is_answer' not in request.session:
    request.session['is_answer'] = False


  # Reset the session when the game starts
  if 'current_question_index' not in request.session:
    request.session['current_question_index'] = 0

  # Get the current question index from session (or start at 0)
  current_index = request.session.get('current_question_index', 0)
  
  # Fetch all questions
  questions = Question.objects.all()

  if current_index < len(questions):
      current_question = questions[current_index]

      feedback = None # To hold feedback about the answer
  else:
      # Game over logic
      if int(activePlayerScore.player1score) > int(activePlayerScore.player2score):
        endMsg = f'{player1} Wins!'
      elif int(activePlayerScore.player1score) < int(activePlayerScore.player2score):
        endMsg = f'{player2} Wins!'
      else:
        endMsg = f'Its a Tie!'

      threading.Thread(target=speak_text, args=(endMsg,)).start()
      return render(request, 'game_over.html', {'endMessage': endMsg})

  # Handle the "Next" button click
  if request.session['is_answer'] == True:
      selected_answer = request.POST.get('answer')
      # Check if the answer is correct
      if selected_answer == current_question.correct_answer:
        feedback = "That was Correct! Good Job"
        threading.Thread(target=speak_text, args=(feedback,)).start()
      else:
        feedback = f"Incorrect! The correct answer was: {current_question.correct_answer}"
        threading.Thread(target=speak_text, args=(feedback,)).start()

      # Move to the next question only after displaying feedback
      request.session['current_question_index'] = current_index + 1
      
      #ensure that next time the page loads it will load a question page
      request.session['is_answer'] = False

  else:
    request.session['is_answer'] = True
    # Run TTS in a separate thread to avoid blocking the UI
    threading.Thread(target=speak_text, args=(current_question.text,)).start()

  return render(request, 'index.html', {'question': current_question, 'feedback': feedback, "player1": player1, "player2": player2, 'score1': activePlayerScore.player1score, 'score2': activePlayerScore.player2score, })



def reset_game(request):
  # Clear the session to restart the game
  request.session['current_question_index'] = 0
  return redirect('start_game')

@csrf_exempt
def submitAnswer(request):
  """Receive button press logs from JavaScript and store them in the database"""
  if request.method == 'POST':
    # Data passed by js
    data = json.loads(request.body)
    playerAnswer = data.get('playerAnswer')
    correctAnswer = data.get('correctAnswer')
    player = data.get('player')
    # The active player score object
    global activePlayerScore
    print(data)
    # Logic to determine score adjustments
    if playerAnswer and correctAnswer:
      if playerAnswer == correctAnswer:
        if player == '1':
          print("updating scores")
          activePlayerScore.player1score = str(int(activePlayerScore.player1score) + 1)
          activePlayerScore.save()
          print(activePlayerScore.player1score)
        if player == '2':
          print("updating scores")
          activePlayerScore.player2score = str(int(activePlayerScore.player2score) + 1)
          activePlayerScore.save()
          print(activePlayerScore.player2score)

      else:
        if player == '1':
          print("updating scores")
          activePlayerScore.player1score = str(int(activePlayerScore.player1score) - 1)
          activePlayerScore.save()
          print(activePlayerScore.player1score)
        if player == '2':
          print("updating scores")
          activePlayerScore.player2score = str(int(activePlayerScore.player2score) - 1)
          activePlayerScore.save()
          print(activePlayerScore.player2score)

      return JsonResponse({'status': 'success'}, status=200)

  return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)



# Recieving button and time information
@csrf_exempt
def log_button_press(request):
  """Receive button press logs from JavaScript and store them in the database"""
  if request.method == 'POST':
    data = json.loads(request.body)
    button_name = data.get('button_name')

    if button_name:
      ButtonPressLog.objects.create(button_name=button_name)
      return JsonResponse({'status': 'success'}, status=200)

  return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)