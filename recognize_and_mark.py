import cv2
import os
import face_recognition
import numpy as np
from attendance import mark_attendance
import time

DATASET_DIR = "dataset"

# Step 1: Load known student faces
known_encodings = []
known_names = []

print("[INFO] Loading dataset...")

for student_name in os.listdir(DATASET_DIR):
    student_folder = os.path.join(DATASET_DIR, student_name)
    if not os.path.isdir(student_folder):
        continue
    
    for filename in os.listdir(student_folder):
        img_path = os.path.join(student_folder, filename)
        try:
            image = face_recognition.load_image_file(img_path)
            encodings = face_recognition.face_encodings(image)
            if encodings:
                known_encodings.append(encodings[0])
                known_names.append(student_name)
        except Exception as e:
            print(f"[WARNING] Skipping {img_path}: {e}")

print(f"[INFO] Loaded {len(known_names)} student images.")

# Step 2: Open webcam (macOS safe)
video_capture = cv2.VideoCapture(0, cv2.CAP_AVFOUNDATION)

if not video_capture.isOpened():
    print("❌ Cannot open webcam. Check camera permissions.")
    exit(1)

while True:
    ret, frame = video_capture.read()
    if not ret or frame is None:
        print("❌ Failed to grab frame. Retrying...")
        time.sleep(0.1)
        continue
    
    # Convert from BGR to RGB
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    
    # Detect faces
    face_locations = face_recognition.face_locations(rgb_frame)
    face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
    
    for face_encoding, face_location in zip(face_encodings, face_locations):
        matches = face_recognition.compare_faces(known_encodings, face_encoding, tolerance=0.5)
        face_distances = face_recognition.face_distance(known_encodings, face_encoding)
        
        best_match_index = np.argmin(face_distances)
        
        top, right, bottom, left = face_location

        if matches[best_match_index]:
            name = known_names[best_match_index]
            mark_attendance(name)  # Store in MongoDB
            cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)
            cv2.putText(frame, name, (left, top - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0,255,0), 2)
        else:
            cv2.rectangle(frame, (left, top), (right, bottom), (0, 0, 255), 2)
            cv2.putText(frame, "Unknown", (left, top - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0,0,255), 2)
    
    cv2.imshow("Attendance System", frame)
    
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

video_capture.release()
cv2.destroyAllWindows()
