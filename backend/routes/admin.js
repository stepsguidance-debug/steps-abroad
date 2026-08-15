const router = require("express").Router();
const bcrypt = require("bcryptjs");
const StudentAccount = require("../models/StudentAccount");
const Result = require("../models/Result");
const { verifyJWT, requireAdmin } = require("../middleware/auth");
const { deleteStudent } = require("../services/studentService");
const { validateStrictGmail } = require("../utils/gmail");

router.use(verifyJWT, requireAdmin);

router.get("/students", async (req, res, next) => {
  try {
    console.log("[admin] GET /students hit by", req.user?._id || "unknown");
    const studentsSnap = await StudentAccount.collection().orderBy("createdAt", "desc").get();
    const students = studentsSnap.docs.map(doc => ({ _id: doc.id, ...doc.data() }));

    const resultsSnap = await Result.collection().get();
    const results = resultsSnap.docs
      .map(doc => ({ _id: doc.id, ...doc.data() }))
      .filter(r => students.some(s => s._id === r.userId));

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

    const gmail = validateStrictGmail(email);
    if (!gmail.ok) {
      return res.status(400).json({ error: gmail.error });
    }

    const existingSnap = await StudentAccount.collection().where("email", "==", gmail.normalized).limit(1).get();
    if (!existingSnap.empty) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newStudentData = {
      name,
      email: gmail.normalized,
      password: hashedPassword,
      role: "student",
      status: "pending",
      createdAt: new Date(),
    };
    
    const ref = await StudentAccount.collection().add(newStudentData);
    const student = { _id: ref.id, ...newStudentData };

    res.status(201).json({
      _id: student._id,
      name: student.name,
      email: student.email,
      role: "student",
      status: student.status,
      aiReadiness: null,
    });
  } catch (error) {
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
