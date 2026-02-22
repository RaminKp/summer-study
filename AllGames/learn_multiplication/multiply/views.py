from django.shortcuts import render
from django.http import JsonResponse
import random
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

def mutliply_view(request):
    return render(request, 'multiply.html')

class MyApiView(APIView):
    def get(self, request):
        data = {"message": "Hello from Django API!"}
        return Response(data, status=status.HTTP_200_OK)
    
def generate_questions(request):
    questions = []
    for _ in range(9):
        num1 = random.randint(1, 10)
        num2 = random.randint(1, 10)
        question = f"What is {num1} x {num2}?"
        answer = num1 * num2
        questions.append({"question": question, "answer": answer, "num1": num1, "num2": num2})
    return JsonResponse({"questions": questions})