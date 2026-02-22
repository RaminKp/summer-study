from django.db import models

class QuizResult(models.Model):
    user_name = models.CharField(max_length=100)
    score = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user_name} - {self.score}"

class GameLog(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    screen = models.CharField(max_length=100)
    player = models.CharField(max_length=100)
    trial_number = models.IntegerField(null=True, blank=True)
    voice_text = models.TextField(null=True, blank=True)
    button_clicked = models.CharField(max_length=100, null=True, blank=True)
    score = models.IntegerField(default=0)
    duration = models.FloatField(null=True, blank=True)  # in seconds
    total_trials = models.IntegerField(default=0)
    correct_trials = models.IntegerField(default=0)
    incorrect_trials = models.IntegerField(default=0)
    hints_used = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.timestamp} | {self.screen} | {self.player}"

