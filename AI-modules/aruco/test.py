import cv2
import cv2.aruco as aruco

cap = cv2.VideoCapture(0)

# Use a standard dictionary of ArUco markers
aruco_dict = aruco.getPredefinedDictionary(aruco.DICT_6X6_250)
parameters = aruco.DetectorParameters()

detected_ids = set()

while True:
    ret, frame = cap.read()
    if not ret:
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    corners, ids, _ = aruco.detectMarkers(gray, aruco_dict, parameters=parameters)

    if ids is not None:
        aruco.drawDetectedMarkers(frame, corners, ids)
        for id_val in ids.flatten():
            if id_val not in detected_ids:
                print("Detected ArUco ID:", id_val)
                detected_ids.add(id_val)
            cv2.putText(frame, f"ID: {id_val}", (30, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)

    cv2.imshow("ArUco Scanner", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
