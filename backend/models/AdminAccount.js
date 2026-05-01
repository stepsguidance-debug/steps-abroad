const mongoose = require("mongoose");
const { adminConnection } = require("../db");

const AdminAccountSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, default: "admin", enum: ["admin"] },
  createdAt: { type: Date, default: Date.now },
}, { versionKey: false });

module.exports = adminConnection.model("AdminAccount", AdminAccountSchema, "admin_accounts");
