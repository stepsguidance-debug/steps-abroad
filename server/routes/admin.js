const router = require("express").Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Result = require("../models/Result");
const { verifyJWT, requireAdmin } = require("../middleware/auth");

router.use(verifyJWT, requireAdmin);

router.get("/users", async (_req, res, next) => {
  try {
    const students = await User.find({ role: "student" }).sort({ createdAt: -1 }).lean();
    const results = await Result.find({ userId: { $in: students.map((s) => s._id) } }).lean();
    const byUser = new Map(results.map((r) => [String(r.userId), r]));
    res.json(students.map((s) => ({
      _id: s._id, name: s.name, email: s.email, role: s.role, status: s.status,
      aiReadiness: byUser.get(String(s._id))?.aiReadinessIndex ?? null,
    })));
  } catch (e) { next(e); }
});

router.post("/users", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "Missing fields" });
    const passwordHash = await bcrypt.hash(password, 10);
    const u = await User.create({ name, email, passwordHash, role: "student", status: "pending" });
    res.status(201).json({ _id: u._id, name: u.name, email: u.email, role: u.role, status: u.status, aiReadiness: null });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: "Email already exists" });
    next(e);
  }
});

router.delete("/users/:id", async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Result.deleteOne({ userId: req.params.id });
    res.status(204).end();
  } catch (e) { next(e); }
});

module.exports = router;
