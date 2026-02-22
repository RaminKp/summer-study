from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('mygame.urls')),  # Directs root URL to mygame app
]
