const mongoose = require("mongoose");
const { studentConnection } = require("../db");

const CareerRoleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  aiRisk: { type: String, required: true, enum: ["safe", "at-risk", "high-risk"] },
  riskLabel: { type: String, required: true },
  whatAiIsDoing: { type: String, required: true },
  whatStudentShouldDo: { type: String, required: true },
}, { _id: false });

const CareerFitEntrySchema = new mongoose.Schema({
  career: { type: String, required: true },
  matchPercent: { type: Number, required: true },
  ugDegrees: { type: [String], default: [] },
  pgDegrees: { type: [String], default: [] },
  jobRoles: { type: [CareerRoleSchema], default: [] },
}, { _id: false });

const RejectedCareerSchema = new mongoose.Schema({
  career: { type: String, required: true },
  matchPercent: { type: Number, required: true },
  reason: { type: String, required: true },
}, { _id: false });

const ResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true, index: true },
  generatedAt: { type: Date, default: Date.now },
  traitScores: {
    analytical: { type: Number, required: true },
    creative: { type: Number, required: true },
    applied: { type: Number, required: true },
    social: { type: Number, required: true },
  },
  behaviourProfile: {
    ambiguity: { type: String, enum: ["High", "Medium", "Low"], required: true },
    discipline: { type: String, enum: ["High", "Medium", "Low"], required: true },
    riskAppetite: { type: String, enum: ["High", "Medium", "Low"], required: true },
  },
  aiReadinessIndex: { type: Number, required: true },
  sectionScores: [{
    section: { type: String, required: true },
    score: { type: Number, required: true },
    fit: { type: String, enum: ["Strong", "Moderate", "Weak"], required: true },
  }],
  contradictionFlags: { type: [String], default: [] },
  careerFit: {
    primary: { type: CareerFitEntrySchema, required: true },
    secondary: { type: CareerFitEntrySchema, required: true },
    rejected: { type: [RejectedCareerSchema], default: [] },
  },
  aiSuggestionSummary: { type: String, required: true },
}, { versionKey: false });

module.exports = studentConnection.model("Result", ResultSchema, "results");
