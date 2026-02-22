from django.db import models

class Player(models.Model):
    aruco_id = models.IntegerField(unique=True)

    def __str__(self):
        return f"Player {self.aruco_id}"

class GamePlay(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE)
    game_name = models.CharField(max_length=100)
    play_count = models.IntegerField(default=0)

    class Meta:
        unique_together = ('player', 'game_name')

    def __str__(self):
        return f"{self.player} - {self.game_name} ({self.play_count} times)"
