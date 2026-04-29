const router = require("express").Router();
const Question = require("../models/Question");
const { verifyJWT } = require("../middleware/auth");

router.get("/", verifyJWT, async (_req, res, next) => {
  try {
    const items = await Question.find().sort({ order: 1 }).lean();
    res.json(items);
  } catch (e) { next(e); }
});

module.exports = router;
