const router = require("express").Router();
const Response = require("../models/Response");
const Result = require("../models/Result");
const User = require("../models/User");
const Question = require("../models/Question");
const { verifyJWT } = require("../middleware/auth");
const { analyzeProfile, checkAiRisk } = require("../services/gemini");

router.post("/submit", verifyJWT, async (req, res, next) => {
  try {
    const { answers } = req.body;
    if (!Array.isArray(answers) || !answers.length) return res.status(400).json({ error: "No answers" });

    await Response.create({ userId: req.user._id, answers });
    await User.findByIdAndUpdate(req.user._id, { status: "completed" });

    const questions = await Question.find().lean();
    const profile = await analyzeProfile({ user: req.user, questions, answers });

    // Enrich career roles in parallel with AI risk
    const enrich = async (item) => {
      const risk = await checkAiRisk(item.title);
      return { ...item, ...risk };
    };
    profile.careerFit.primary   = await Promise.all(profile.careerFit.primary.map(enrich));
    profile.careerFit.secondary = await Promise.all(profile.careerFit.secondary.map(enrich));

    const saved = await Result.findOneAndUpdate(
      { userId: req.user._id },
      { ...profile, userId: req.user._id, userName: req.user.name, generatedAt: new Date() },
      { upsert: true, new: true },
    );
    res.json(saved);
  } catch (e) { next(e); }
});

module.exports = router;
