const router = require("express").Router();
const Question = require("../models/Question");
const Response = require("../models/Response");
const StudentAccount = require("../models/StudentAccount");
const { verifyJWT } = require("../middleware/auth");
const { generateResultForUser } = require("../services/resultService");

router.post("/submit", verifyJWT, async (req, res, next) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ error: "Student only" });
    }

    const existingResponse = await Response.findOne({ userId: req.user._id }).lean();
    if (existingResponse) {
      return res.status(409).json({ error: "Assessment already completed. Retakes are not allowed." });
    }

    const { answers } = req.body;
    if (!Array.isArray(answers) || !answers.length) {
      return res.status(400).json({ error: "No answers provided" });
    }

    const questions = await Question.find().lean();
    if (answers.length !== questions.length) {
      return res.status(400).json({ error: `Expected ${questions.length} answers` });
    }
    const questionMap = new Map(questions.map((question) => [String(question._id), question]));

    const normalizedAnswers = answers.map((answer) => {
      const question = questionMap.get(String(answer.questionId));
      if (!question) {
        const error = new Error(`Question not found: ${answer.questionId}`);
        error.status = 400;
        throw error;
      }

      const choice = question.choices.find((item) => item.value === answer.value || item.value === answer.selectedValue);
      if (!choice) {
        const error = new Error(`Invalid answer choice for question ${question._id}`);
        error.status = 400;
        throw error;
      }

      const customAnswer = String(answer.customAnswer || "").trim();
      if (choice.allowCustomInput && !customAnswer) {
        const error = new Error(`Custom answer is required for ${question.questionText}`);
        error.status = 400;
        throw error;
      }

      return {
        questionId: question._id,
        section: question.section,
        selectedValue: choice.allowCustomInput && customAnswer ? customAnswer : choice.value,
        selectedLabel: choice.allowCustomInput && customAnswer ? customAnswer : choice.label,
        customAnswer,
      };
    });

    await Response.create({ userId: req.user._id, answers: normalizedAnswers });
    await StudentAccount.findByIdAndUpdate(req.user._id, { status: "answered" });

    const result = await generateResultForUser(req.user._id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
