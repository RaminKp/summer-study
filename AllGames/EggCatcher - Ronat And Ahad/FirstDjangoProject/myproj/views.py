from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.
def index(request):
    return render(request, 'index.html')
def play(request):
    return render(request,'play.html')
def math(request):
    return render(request,'math.html')
def word(request):
    return render(request,'word.html')

