const mongoose = require("mongoose");
const { adminConnection } = require("../db");

const StudentAccountSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, default: "student", enum: ["student"] },
  status: { type: String, enum: ["pending", "answered"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
}, { versionKey: false });

module.exports = adminConnection.model("StudentAccount", StudentAccountSchema, "student_accounts");
