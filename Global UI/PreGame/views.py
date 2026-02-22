from django.shortcuts import render
from django.http import StreamingHttpResponse
from django.http import JsonResponse
import cv2
import cv2.aruco as aruco
from django.shortcuts import render, redirect
from .models import Player, GamePlay


last_detected_id = None  # Global variable

def gen_frames():
    global last_detected_id

    cap = cv2.VideoCapture(0)
    aruco_dict = aruco.getPredefinedDictionary(aruco.DICT_6X6_250)
    parameters = aruco.DetectorParameters()

    while True:
        success, frame = cap.read()
        if not success:
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        corners, ids, _ = aruco.detectMarkers(gray, aruco_dict, parameters=parameters)

        if ids is not None:
            last_detected_id = int(ids[0][0])
            aruco.drawDetectedMarkers(frame, corners, ids)

        _, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

def check_marker(request):
    global last_detected_id
    if last_detected_id:
        request.session['aruco_id'] = last_detected_id
        return JsonResponse({'detected': True})
    return JsonResponse({'detected': False})

def video_feed(request):
    return StreamingHttpResponse(gen_frames(), content_type='multipart/x-mixed-replace; boundary=frame')

def scan_page(request):
    return render(request, 'scan.html')

def start_page(request):
    global last_detected_id
    request.session.pop('aruco_id', None)
    last_detected_id = None  # reset global detected ID
    return render(request, 'index.html')

def games_page(request):
    aruco_id = request.session.get('aruco_id', None)
    if not aruco_id:
        # simulate setting aruco_id
        request.session['aruco_id'] = 101  # example ID
        aruco_id = 101
    return render(request, 'games.html', {'aruco_id': aruco_id})

def play_game(request, game_name):
    aruco_id = request.session.get('aruco_id')
    if aruco_id is None:
        return redirect('games')  # fallback if ID is missing

    player, _ = Player.objects.get_or_create(aruco_id=aruco_id)
    gameplay, created = GamePlay.objects.get_or_create(player=player, game_name=game_name)
    gameplay.play_count += 1
    gameplay.save()

    return render(request, 'game_result.html', {'game_name': game_name, 'count': gameplay.play_count})