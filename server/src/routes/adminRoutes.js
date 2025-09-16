// routes/adminRoutes.js
import express from "express";
import Attendance from "../models/Attendance.js";
import User from "../models/User.js";
import moment from "moment";

const router = express.Router();

// 📌 Get today's attendance (auto-mark absentees if after 9:15am)
router.get("/attendance/today", async (req, res) => {
  try {
    const today = moment().startOf("day");
    const now = moment();

    // 1. Fetch all students
    const students = await User.find({ role: "Student" });

    // 2. Fetch today's attendance records
    let records = await Attendance.find({
      date: { $gte: today.toDate(), $lt: moment(today).endOf("day").toDate() },
    }).populate("studentId", "_id name username email registernumber");

    // 3. If after 9:15 AM → mark absentees
    if (now.isAfter(today.clone().hour(9).minute(15))) {
      const attendedIds = records
        .filter((r) => r.studentId) // only valid ones
        .map((r) => r.studentId._id.toString());

      const absentees = students.filter(
        (s) => !attendedIds.includes(s._id.toString())
      );

      for (const s of absentees) {
        await Attendance.create({
          studentId: s._id,
          date: now.toDate(),
          status: "Absent",
        });
      }

      // Re-fetch updated records
      records = await Attendance.find({
        date: { $gte: today.toDate(), $lt: moment(today).endOf("day").toDate() },
      }).populate("studentId", "_id name username email registernumber");
    }

    // 4. Safe response format
    const safeRecords = records.map((r) => ({
      _id: r._id,
      date: r.date,
      status: r.status,
      student: r.studentId
        ? {
            _id: r.studentId._id,
            name: r.studentId.name,
            registernumber: r.studentId.registernumber || r.studentId.username, // ✅ fallback
            username: r.studentId.username,
            email: r.studentId.email,
          }
        : null,
    }));

    res.json({ records: safeRecords });
  } catch (err) {
    console.error("❌ Error fetching today's attendance:", err);
    res.status(500).json({ error: "Failed to fetch today's attendance" });
  }
});

export default router;
