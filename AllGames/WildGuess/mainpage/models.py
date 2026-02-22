from django.db import models
from django.utils.timezone import now
# Create your models here.


class ButtonPressLog(models.Model):
  button_name = models.CharField(max_length=50)  # E.g., "Next", "Submit"
  timestamp = models.DateTimeField(default=now)  # Auto record the time

  def __str__(self):
    return f"{self.button_name} pressed at {self.timestamp}"
  
class score(models.Model):
  scoreVal = models.IntegerField()
  animal = models.CharField(max_length=50)

  def __str__(self):
    return f"{self.animal}, {self.scoreVal}"