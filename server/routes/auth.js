const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AdminAccount = require("../models/AdminAccount");
const StudentAccount = require("../models/StudentAccount");
const { serializeUser } = require("../middleware/auth");

router.post("/login", async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    const identifier = String(email || "").trim().toLowerCase();
    if (!identifier || !password || !role) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    const Model = role === "admin" ? AdminAccount : StudentAccount;
    const query = role === "admin" ? { username: identifier } : { email: identifier };
    const user = await Model.findOne(query);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { sub: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
    res.json({ token, user: serializeUser(user) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
