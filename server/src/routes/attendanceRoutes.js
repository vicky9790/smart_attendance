// server/src/routes/attendanceRoutes.js
import express from "express";
import mongoose from "mongoose";
import Attendance from "../models/Attendance.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================
// GET /api/attendance/mine
// Student: Get their own attendance records
// ==========================
router.get("/mine", authMiddleware, async (req, res) => {
  try {
    const studentObjectId = new mongoose.Types.ObjectId(req.user._id);

    const records = await Attendance.find({ studentId: studentObjectId }).sort({ date: 1 });
    res.json(records);
  } catch (err) {
    console.error("Error fetching attendance:", err.message);
    res.status(500).json({ error: "Failed to fetch attendance" });
  }
});

// ==========================
// POST /api/attendance/mark
// Admin/Teacher/Face Recognition: Mark attendance
// ==========================
router.post("/mark", async (req, res) => {
  try {
    const { studentId, date, status } = req.body;

    if (!studentId || !date || !status) {
      return res.status(400).json({ error: "studentId, date, and status are required" });
    }

    const studentObjectId = new mongoose.Types.ObjectId(studentId);

    // Normalize date to midnight to prevent duplicates
    const markDate = new Date(date);
    markDate.setHours(0, 0, 0, 0);

    // Check for existing attendance for the day
    const existing = await Attendance.findOne({
      studentId: studentObjectId,
      date: markDate,
    });

    if (existing) {
      return res.json({ message: "Attendance already marked for this date", record: existing });
    }

    const record = new Attendance({
      studentId: studentObjectId,
      date: markDate,
      status,
    });

    await record.save();
    res.json({ message: "Attendance marked successfully", record });
  } catch (err) {
    console.error("Error marking attendance:", err.message);
    res.status(500).json({ error: "Failed to mark attendance" });
  }
});

// ==========================
// GET /api/attendance/all
// Admin: Get all attendance records + summary
// ==========================
router.get("/all", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const records = await Attendance.find()
      .populate("studentId", "username name email")
      .sort({ date: 1 });

    // Calculate total attendance per student
    const attendanceSummary = {};
    records.forEach((rec) => {
      const uid = rec.studentId?._id.toString();
      if (!attendanceSummary[uid]) attendanceSummary[uid] = { total: 0, present: 0 };

      attendanceSummary[uid].total += 1;
      if (rec.status === "Present") attendanceSummary[uid].present += 1;
    });

    res.json({ records, summary: attendanceSummary });
  } catch (err) {
    console.error("Error fetching all attendance:", err.message);
    res.status(500).json({ error: "Failed to fetch all attendance" });
  }
});

// ==========================
// GET /api/attendance/student/:id
// Admin: Get attendance for a single student
// ==========================
router.get("/student/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const studentId = req.params.id;
    const studentObjectId = new mongoose.Types.ObjectId(studentId);

    const records = await Attendance.find({ studentId: studentObjectId }).sort({ date: 1 });
    res.json(records);
  } catch (err) {
    console.error("Error fetching student attendance:", err.message);
    res.status(500).json({ error: "Failed to fetch student attendance" });
  }
});

export default router;
