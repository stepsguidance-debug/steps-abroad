const router = require("express").Router();
const Result = require("../models/Result");
const StudentAccount = require("../models/StudentAccount");
const { verifyJWT } = require("../middleware/auth");
const { generateResultForUser } = require("../services/resultService");

router.get("/:userId", verifyJWT, async (req, res, next) => {
  try {
    if (req.user.role !== "admin" && String(req.user._id) !== req.params.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const [result, student] = await Promise.all([
      Result.findOne({ userId: req.params.userId }).lean(),
      StudentAccount.findById(req.params.userId).lean(),
    ]);

    if (!result) return res.status(404).json({ error: "Not found" });

    res.json({
      ...result,
      userName: student?.name || "Student",
    });
  } catch (error) {
    next(error);
  }
});

router.post("/generate/:userId", verifyJWT, async (req, res, next) => {
  try {
    if (req.user.role !== "admin" && String(req.user._id) !== req.params.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const result = await generateResultForUser(req.params.userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
