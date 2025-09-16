import cv2
import face_recognition
import requests
import datetime
import os

# Backend API to mark attendance
API_URL = "http://localhost:5001/api/attendance/mark"

# Set this to your MongoDB student's ObjectId
STUDENT_ID = "68bd0b336a805f6bc87144de"  

# Path to reference image (dataset/student1.jpg)
ref_path = os.path.join(os.path.dirname(__file__), "dataset", "student1.jpg")
if not os.path.exists(ref_path):
    print(f"❌ Reference image not found at {ref_path}")
    exit(1)

# Load and encode reference face
ref_img = face_recognition.load_image_file(ref_path)
encs = face_recognition.face_encodings(ref_img)
if len(encs) == 0:
    print("❌ No face found in reference image")
    exit(1)
ref_encoding = encs[0]

# Start webcam
video = cv2.VideoCapture(0)
if not video.isOpened():
    print("❌ Cannot open webcam")
    exit(1)

print("🎥 Starting webcam. Press 'q' to quit.")
while True:
    ret, frame = video.read()
    if not ret:
        break
    rgb_frame = frame[:, :, ::-1]
    faces = face_recognition.face_locations(rgb_frame)
    encodings = face_recognition.face_encodings(rgb_frame, faces)

    for encoding in encodings:
        match = face_recognition.compare_faces([ref_encoding], encoding, tolerance=0.5)
        if match[0]:
            date_today = datetime.date.today().isoformat()
            payload = {
                "studentId": STUDENT_ID,
                "date": date_today,
                "status": "Present"
            }
            try:
                res = requests.post(API_URL, json=payload, timeout=3)
                if res.status_code == 200:
                    print(f"✅ Attendance marked for {STUDENT_ID} on {date_today}")
                else:
                    print(f"⚠️ API error {res.status_code}: {res.text}")
            except Exception as e:
                print("❌ Failed to call API:", e)

    # Show webcam feed
    cv2.imshow("Webcam - Press 'q' to quit", frame)
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

video.release()
cv2.destroyAllWindows()
