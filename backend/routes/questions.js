const router = require("express").Router();
const Question = require("../models/Question");
const { verifyJWT, requireAdmin } = require("../middleware/auth");
const { createQuestion, deleteQuestion, deleteQuestionOption, sanitizeLeanQuestion } = require("../services/questionService");

router.get("/", verifyJWT, async (_req, res, next) => {
  try {
    const docs = await Question.find().sort({ order: 1 }).lean();
    const questions = docs.map((d) => sanitizeLeanQuestion(d)).filter(Boolean);
    res.json(questions);
  } catch (error) {
    next(error);
  }
});

router.post("/", verifyJWT, requireAdmin, async (req, res, next) => {
  try {
    const question = await createQuestion(req.body);
    res.status(201).json(question);
  } catch (error) {
    next(error);
  }
});

router.delete("/:questionId", verifyJWT, requireAdmin, async (req, res, next) => {
  try {
    await deleteQuestion(req.params.questionId);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

router.delete("/:questionId/options/:optionValue", verifyJWT, requireAdmin, async (req, res, next) => {
  try {
    const updated = await deleteQuestionOption(req.params.questionId, req.params.optionValue);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
