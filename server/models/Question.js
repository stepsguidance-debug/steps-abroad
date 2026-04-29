const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  section: { type: String, required: true },        // A..G
  sectionTitle: { type: String, required: true },
  text: { type: String, required: true },
  type: { type: String, enum: ["mcq", "scale", "forced"], required: true },
  options: [String],
  order: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Question", QuestionSchema);
