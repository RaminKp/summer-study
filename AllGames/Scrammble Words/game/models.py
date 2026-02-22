from django.db import models

class GameResult(models.Model):
    player_name = models.CharField(max_length=100)
    difficulty = models.CharField(max_length=10)
    correct_count = models.IntegerField()
    wrong_count = models.IntegerField()
    total_attempts = models.IntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.player_name} - {self.difficulty}"