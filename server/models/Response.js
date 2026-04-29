const mongoose = require("mongoose");

const ResponseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    value: mongoose.Schema.Types.Mixed,
  }],
  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Response", ResponseSchema);
