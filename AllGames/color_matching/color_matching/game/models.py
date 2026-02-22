from django.db import models

class Item(models.Model):
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=50)  # e.g., 'red', 'green', 'blue', etc.
    image_url = models.URLField(blank=True, null=True)  # or you could store images differently

    def __str__(self):
        return self.name
