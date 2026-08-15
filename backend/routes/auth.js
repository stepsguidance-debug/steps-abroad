const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AdminAccount = require("../models/AdminAccount");
const StudentAccount = require("../models/StudentAccount");
const { serializeUser } = require("../middleware/auth");
const { validateStrictGmail } = require("../utils/gmail");

router.post("/login", async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    let identifier = String(email || "").trim().toLowerCase();
    if (!identifier || !password || !role) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    if (role === "student") {
      const gmail = validateStrictGmail(identifier);
      if (!gmail.ok) {
        return res.status(400).json({ error: gmail.error });
      }
      identifier = gmail.normalized;
    }

    const Model = role === "admin" ? AdminAccount : StudentAccount;
    const queryField = role === "admin" ? "username" : "email";
    const snap = await Model.collection().where(queryField, "==", identifier).limit(1).get();
    const user = snap.empty ? null : { _id: snap.docs[0].id, ...snap.docs[0].data() };
    
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
