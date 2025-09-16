import cv2
import os
import face_recognition
import numpy as np
import requests
from datetime import datetime

API_URL = "http://localhost:5001/api/attendance/mark"
DATASET_DIR = "server/recognition/dataset"

# Step 1: Load known student faces
known_encodings = []
known_ids = []

print("[INFO] Loading dataset...")

for student_id in os.listdir(DATASET_DIR):
    student_folder = os.path.join(DATASET_DIR, student_id)
    if not os.path.isdir(student_folder):
        continue

    for filename in os.listdir(student_folder):
        img_path = os.path.join(student_folder, filename)
        image = face_recognition.load_image_file(img_path)
        encodings = face_recognition.face_encodings(image)
        if encodings:
            known_encodings.append(encodings[0])
            known_ids.append(student_id)

print(f"[INFO] Loaded {len(known_ids)} student images.")

# Step 2: Start webcam
video_capture = cv2.VideoCapture(0)
print("[INFO] Starting webcam. Press 'q' to quit.")

# To avoid marking multiple times per session
marked_students = set()

def mark_attendance(student_id):
    if student_id in marked_students:
        return  # Already marked in this session

    payload = {
        "studentId": student_id,
        "date": datetime.now().strftime("%Y-%m-%d"),
        "status": "Present"
    }

    try:
        response = requests.post(API_URL, json=payload)
        response.raise_for_status()  # Raise HTTPError for bad responses
        print(f"[INFO] Attendance marked for {student_id}")
        marked_students.add(student_id)
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Failed to mark attendance for {student_id}: {e}")
        if hasattr(e.response, 'text'):
            print(f"[DEBUG] Response content: {e.response.text}")

while True:
    ret, frame = video_capture.read()
    if not ret:
        break

    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    face_locations = face_recognition.face_locations(rgb_frame)
    face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

    for face_encoding, face_location in zip(face_encodings, face_locations):
        matches = face_recognition.compare_faces(known_encodings, face_encoding, tolerance=0.5)
        face_distances = face_recognition.face_distance(known_encodings, face_encoding)
        best_match_index = np.argmin(face_distances)

        top, right, bottom, left = face_location

        if matches[best_match_index]:
            student_id = known_ids[best_match_index]
            cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)
            cv2.putText(frame, student_id, (left, top - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
            mark_attendance(student_id)
        else:
            cv2.rectangle(frame, (left, top), (right, bottom), (0, 0, 255), 2)
            cv2.putText(frame, "Unknown", (left, top - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)

    cv2.imshow("Attendance System", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

video_capture.release()
cv2.destroyAllWindows()
