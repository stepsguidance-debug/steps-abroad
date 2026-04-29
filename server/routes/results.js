const router = require("express").Router();
const Result = require("../models/Result");
const { verifyJWT } = require("../middleware/auth");

router.get("/:userId", verifyJWT, async (req, res, next) => {
  try {
    // Students can only see their own; admins can see anyone.
    if (req.user.role !== "admin" && String(req.user._id) !== req.params.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const result = await Result.findOne({ userId: req.params.userId }).lean();
    if (!result) return res.status(404).json({ error: "Not found" });
    res.json(result);
  } catch (e) { next(e); }
});

module.exports = router;
