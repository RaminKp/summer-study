from django.db import models
from django.utils.timezone import now

# Create your models here.

class Question(models.Model):
  text = models.CharField(max_length=300)
  correct_answer = models.CharField(max_length=100)
  incorrect_answers = models.JSONField()  # Store multiple incorrect answers
  category = models.CharField(max_length=100, blank=True, null=True)
  difficulty = models.CharField(max_length=50, blank=True, null=True)
  created_at = models.DateTimeField(auto_now_add=True)

  def __str__(self):
    return self.text


class playerScore(models.Model):
  player1name = models.CharField(max_length=50, default="player1")
  player2name = models.CharField(max_length=50, default="player2")
  player1score = models.IntegerField(default=0)
  player2score = models.IntegerField(default=0)

  def  __str__(self):
    return f"Player1: {self.player1name} Player1 Score: {self.player1score} and Player1: {self.player2name} Player2 Score: {self.player2score} "



class ButtonPressLog(models.Model):
  button_name = models.CharField(max_length=50)  # E.g., "Next", "Submit"
  timestamp = models.DateTimeField(default=now)  # Auto record the time

  def __str__(self):
    return f"{self.button_name} pressed at {self.timestamp}"
  