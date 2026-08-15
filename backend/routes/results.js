const router = require("express").Router();
const Result = require("../models/Result");
const StudentAccount = require("../models/StudentAccount");
const { verifyJWT } = require("../middleware/auth");
const { queuedGenerate, queuePositionFor, isQueueProcessing } = require("../services/resultService");

router.get("/queue-status", verifyJWT, (req, res) => {
  res.json({
    position: queuePositionFor(String(req.user._id)),
    isProcessing: isQueueProcessing(),
  });
});

router.get("/:userId", verifyJWT, async (req, res, next) => {
  try {
    if (req.user.role !== "admin" && String(req.user._id) !== req.params.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const [resultSnap, studentDoc] = await Promise.all([
      Result.collection().where("userId", "==", req.params.userId).limit(1).get(),
      StudentAccount.collection().doc(req.params.userId).get(),
    ]);

    const result = resultSnap.empty ? null : resultSnap.docs[0].data();
    const student = studentDoc.exists ? studentDoc.data() : null;

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

    const result = await queuedGenerate(req.params.userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
