import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [records, setRecords] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentAttendance, setStudentAttendance] = useState([]);
  const token = localStorage.getItem("token");

  // ✅ Fetch only today's attendance
  useEffect(() => {
    const fetchTodayAttendance = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5001/api/admin/attendance/today",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const { records } = res.data;
        setRecords(records);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch today's attendance");
      }
    };

    fetchTodayAttendance();
  }, [token]);

  // ✅ Fetch history of one student
  const viewStudentAttendance = async (student) => {
    setSelectedStudent(student);
    try {
      const res = await axios.get(
        `http://localhost:5001/api/attendance/student/${student._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStudentAttendance(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch student attendance");
    }
  };

  return (
    <div className="admin-container">
      <h2>📘 Today's Attendance</h2>
      <table className="attendance-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Register Number</th>
            <th>Date</th>
            <th>Status</th>
            <th>History</th>
          </tr>
        </thead>
        <tbody>
          {records.length === 0 ? (
            <tr>
              <td colSpan="5" className="no-data">
                No attendance records today
              </td>
            </tr>
          ) : (
            records.map((r, i) => {
              const student = r.student || {}; // ✅ use "student", not "studentId"
              return (
                <tr key={i}>
                  <td>{student.name || "N/A"}</td>
                  <td>{student.registernumber || "N/A"}</td>
                  <td>{new Date(r.date).toLocaleDateString()}</td>
                  <td
                    className={r.status === "Present" ? "present" : "absent"}
                  >
                    {r.status}
                  </td>
                  <td>
                    <button
                      className="view-btn"
                      onClick={() => viewStudentAttendance(student)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {selectedStudent && (
        <div className="student-attendance">
          <h3>{selectedStudent.name} - Attendance History</h3>
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {studentAttendance.length === 0 ? (
                <tr>
                  <td colSpan="2" className="no-data">
                    No records found
                  </td>
                </tr>
              ) : (
                studentAttendance.map((a, i) => (
                  <tr key={i}>
                    <td>{new Date(a.date).toLocaleDateString()}</td>
                    <td
                      className={a.status === "Present" ? "present" : "absent"}
                    >
                      {a.status}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
