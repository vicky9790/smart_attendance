
# Smart Attendance - Starter Prototype

This archive contains a starter prototype for the Smart Attendance project:
- React frontend (client)
- Node.js + Express backend (server)
- Python recognition script (recognition)

## Quick start (high-level)

1. Start MongoDB locally (or update `server/.env` to point to your MongoDB).
2. Backend:
   - cd server
   - npm install
   - npm start
3. Frontend:
   - cd client
   - npm install
   - npm start
4. Recognition (Python):
   - cd recognition
   - pip install -r requirements.txt
   - place a reference image at recognition/dataset/student1.jpg
   - update STUDENT_ID in recognize.py with a real MongoDB _id from the users collection
   - python recognize.py

# smart_attendance
