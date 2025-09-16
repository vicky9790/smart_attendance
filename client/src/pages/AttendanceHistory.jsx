import React from "react";

function AttendanceHistory() {
  // Later we will fetch this from backend
  const dummyHistory = [
    { date: "2025-09-01", status: "Present" },
    { date: "2025-09-02", status: "Absent" },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h2>Attendance History</h2>
      <ul>
        {dummyHistory.map((entry, i) => (
          <li key={i}>
            {entry.date}: {entry.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AttendanceHistory;
