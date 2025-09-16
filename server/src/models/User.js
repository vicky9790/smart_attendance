// server/src/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // e.g., roll number or student ID
  password: { type: String, required: true }, // store hashed password
  name: { type: String, required: true }, // full name of student
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ["Student", "Admin"], default: "Student" },
});

export default mongoose.model("User", userSchema);
