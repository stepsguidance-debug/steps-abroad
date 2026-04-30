const mongoose = require("mongoose");
const { studentConnection } = require("../db");

const AnswerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  section: { type: String, enum: ["A", "B", "C", "D", "E", "F", "G"] },
  selectedValue: { type: String, required: true },
  selectedLabel: { type: String, required: true },
  customAnswer: { type: String, default: "" },
}, { _id: false });

const ResponseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true, unique: true },
  submittedAt: { type: Date, default: Date.now },
  isDraft: { type: Boolean, default: false },
  answers: { type: [AnswerSchema], default: [] },
}, { versionKey: false });

module.exports = studentConnection.model("Response", ResponseSchema, "responses");
