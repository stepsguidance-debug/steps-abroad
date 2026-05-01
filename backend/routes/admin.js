const router = require("express").Router();
const bcrypt = require("bcryptjs");
const StudentAccount = require("../models/StudentAccount");
const Result = require("../models/Result");
const { verifyJWT, requireAdmin } = require("../middleware/auth");
const { deleteStudent } = require("../services/studentService");

router.use(verifyJWT, requireAdmin);

router.get("/students", async (req, res, next) => {
  try {
    console.log("[admin] GET /students hit by", req.user?._id || "unknown");
    const students = await StudentAccount.find().sort({ createdAt: -1 }).lean();
    const results = await Result.find({ userId: { $in: students.map((student) => student._id) } }).lean();
    const resultsByUserId = new Map(results.map((result) => [String(result.userId), result]));

    res.json(students.map((student) => ({
      _id: student._id,
      name: student.name,
      email: student.email,
      role: "student",
      status: student.status,
      aiReadiness: resultsByUserId.get(String(student._id))?.aiReadinessIndex ?? null,
    })));
  } catch (error) {
    next(error);
  }
});

router.post("/students", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const student = await StudentAccount.create({
      name,
      email: String(email).toLowerCase().trim(),
      password: hashedPassword,
      role: "student",
      status: "pending",
    });

    res.status(201).json({
      _id: student._id,
      name: student.name,
      email: student.email,
      role: "student",
      status: student.status,
      aiReadiness: null,
    });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: "Email already exists" });
    next(error);
  }
});

router.delete("/students/:id", async (req, res, next) => {
  try {
    await deleteStudent(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
