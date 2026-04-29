const mongoose = require("mongoose");

const ResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  userName: String,
  aiReadinessIndex: Number,
  traitScores: {
    Analytical: Number, Creative: Number, Applied: Number, Social: Number,
  },
  behaviourProfile: String,
  sectionScores: [{
    section: String, title: String, score: Number, fit: String,
  }],
  contradictionFlags: [{ area: String, note: String }],
  careerFit: {
    primary: [{
      title: String, ug: String, pg: String, roles: [String], aiRisk: String, advice: String,
    }],
    secondary: [{
      title: String, ug: String, pg: String, roles: [String], aiRisk: String, advice: String,
    }],
  },
  aiSummary: String,
  generatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Result", ResultSchema);
