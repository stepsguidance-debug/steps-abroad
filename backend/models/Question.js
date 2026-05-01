const mongoose = require("mongoose");
const { adminConnection } = require("../db");

const ChoiceSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, required: true },
  allowCustomInput: { type: Boolean, default: false },
  customInputPlaceholder: { type: String, default: "" },
  weights: {
    analytical: { type: Number, min: 0, max: 10, required: true },
    creative: { type: Number, min: 0, max: 10, required: true },
    applied: { type: Number, min: 0, max: 10, required: true },
    social: { type: Number, min: 0, max: 10, required: true },
    aiReadiness: { type: Number, min: 0, max: 10, required: true },
  },
}, { _id: false });

const QuestionSchema = new mongoose.Schema({
  section: { type: String, required: true, enum: ["A", "B", "C", "D", "E", "F", "G"] },
  sectionTitle: { type: String, required: true },
  order: { type: Number, required: true },
  questionText: { type: String, required: true },
  type: { type: String, required: true, enum: ["mcq", "forced-choice", "scale"] },
  layer: { type: String, required: true, enum: ["L1", "L2", "L3", "L4", "L5"] },
  choices: { type: [ChoiceSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
}, { versionKey: false });

module.exports = adminConnection.model("Question", QuestionSchema, "questions");
