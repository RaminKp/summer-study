from django.db import models

class Player(models.Model):
    name = models.CharField(max_length=100)
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Score(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='scores')
    level = models.CharField(max_length=50)  # For example: "knee_game", "fever_game", "burn_game"
    score = models.IntegerField(default=0)
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.player.name} - {self.level}: {self.score}"

class LogEntry(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    page = models.CharField(max_length=100)
    player = models.CharField(max_length=100, blank=True, null=True)
    event = models.TextField()

    def __str__(self):
        return f"[{self.timestamp}] {self.page} - {self.player or 'Guest'}: {self.event}"
