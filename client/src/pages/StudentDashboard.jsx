import { useEffect, useState } from "react";
import axios from "axios";
import "./StudentDashboard.css";

function StudentDashboard() {
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5001/api/attendance/mine", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAttendance(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch attendance");
      }
    };
    fetchAttendance();
  }, []);

  // Calculate percentage
  const totalDays = attendance.length;
  const presentDays = attendance.filter((a) => a.status === "Present").length;
  const percentage =
    totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;

  return (
    <div className="student-container">
      <h2>📘 My Attendance</h2>

      {attendance.length === 0 ? (
        <p className="no-records">No records yet</p>
      ) : (
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((a, i) => (
              <tr key={i}>
                <td>{new Date(a.date).toLocaleDateString()}</td>
                <td className={a.status === "Present" ? "present" : "absent"}>
                  {a.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3 className="attendance-percentage">
        Attendance Percentage: <span>{percentage}%</span>
      </h3>
    </div>
  );
}

export default StudentDashboard;
