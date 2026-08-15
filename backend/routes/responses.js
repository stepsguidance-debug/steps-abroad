const router = require("express").Router();
const Question = require("../models/Question");
const Response = require("../models/Response");
const StudentAccount = require("../models/StudentAccount");
const { verifyJWT } = require("../middleware/auth");
const { queuedGenerate } = require("../services/resultService");
const { sanitizeLeanQuestion } = require("../services/questionService");

// Save partial draft progress
router.patch("/draft", verifyJWT, async (req, res, next) => {
  try {
    if (req.user.role !== "student") return res.status(403).json({ error: "Student only" });

    const { answers } = req.body;
    if (!Array.isArray(answers)) return res.status(400).json({ error: "answers must be an array" });

    const questionsSnap = await Question.collection().orderBy("order").get();
    const questionsRaw = questionsSnap.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    const questions = questionsRaw.map((d) => sanitizeLeanQuestion(d)).filter(Boolean);
    const questionMap = new Map(questions.map((q) => [String(q._id), q]));

    const normalized = [];
    for (const a of answers) {
      const q = questionMap.get(String(a.questionId));
      if (!q) continue;
      const choice = q.choices.find((c) => c.value === (a.selectedValue || a.value));
      if (!choice && !a.customAnswer) continue;
      normalized.push({
        questionId: q._id,
        section: q.section,
        selectedValue: a.selectedValue || a.value || "",
        selectedLabel: a.selectedLabel || choice?.label || a.selectedValue || "",
        customAnswer: a.customAnswer || "",
      });
    }

    const existingSnap = await Response.collection().where("userId", "==", req.user._id).limit(1).get();
    const existing = existingSnap.empty ? null : existingSnap.docs[0].data();

    if (existing && !existing.isDraft) {
      return res.status(409).json({ error: "Assessment already submitted" });
    }

    if (existingSnap.empty) {
      await Response.collection().add({ userId: req.user._id, isDraft: true, answers: normalized, submittedAt: new Date() });
    } else {
      await existingSnap.docs[0].ref.update({ isDraft: true, answers: normalized, submittedAt: new Date() });
    }

    res.json({ ok: true, count: normalized.length });
  } catch (error) {
    next(error);
  }
});

// Get current draft for the logged-in student
router.get("/draft", verifyJWT, async (req, res, next) => {
  try {
    if (req.user.role !== "student") return res.status(403).json({ error: "Student only" });
    const draftSnap = await Response.collection().where("userId", "==", req.user._id).where("isDraft", "==", true).limit(1).get();
    const draft = draftSnap.empty ? null : draftSnap.docs[0].data();
    if (!draft) return res.status(404).json({ error: "No draft" });
    res.json({
      answers: draft.answers.map((a) => ({
        questionId: String(a.questionId),
        selectedValue: a.selectedValue,
        selectedLabel: a.selectedLabel,
        customAnswer: a.customAnswer,
      })),
      savedAt: draft.submittedAt,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/submit", verifyJWT, async (req, res, next) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ error: "Student only" });
    }

    const existingSnap = await Response.collection().where("userId", "==", req.user._id).limit(1).get();
    const existingResponse = existingSnap.empty ? null : existingSnap.docs[0].data();
    if (existingResponse && existingResponse.isDraft === false) {
      return res.status(409).json({ error: "Assessment already completed. Retakes are not allowed." });
    }

    const { answers } = req.body;
    if (!Array.isArray(answers) || !answers.length) {
      return res.status(400).json({ error: "No answers provided" });
    }

    const questionsSnap = await Question.collection().orderBy("order").get();
    const questionsRaw = questionsSnap.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    const questions = questionsRaw.map((d) => sanitizeLeanQuestion(d)).filter(Boolean);
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

    if (existingSnap.empty) {
      await Response.collection().add({ userId: req.user._id, isDraft: false, answers: normalizedAnswers, submittedAt: new Date() });
    } else {
      await existingSnap.docs[0].ref.update({ isDraft: false, answers: normalizedAnswers, submittedAt: new Date() });
    }
    await StudentAccount.collection().doc(req.user._id).update({ status: "answered" });

    const result = await queuedGenerate(req.user._id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
