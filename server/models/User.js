const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["admin", "student"], default: "student" },
  status: { type: String, enum: ["pending", "in_progress", "completed"], default: "pending" },
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
