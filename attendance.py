from datetime import datetime
from db_connect import get_db

db = get_db()
attendance_collection = db["attendance"]

def mark_attendance(student_name):
    today = datetime.now().strftime("%Y-%m-%d")
    
    # Check if already marked today
    record = attendance_collection.find_one({
        "name": student_name,
        "date": today
    })

    if record:
        print(f"[INFO] {student_name} already marked present today.")
        return
    
    # Insert new record
    attendance_collection.insert_one({
        "name": student_name,
        "date": today,
        "status": "Present",
        "time": datetime.now().strftime("%H:%M:%S")
    })
    print(f"[INFO] Marked {student_name} present.")
