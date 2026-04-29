const jwt = require("jsonwebtoken");
const AdminAccount = require("../models/AdminAccount");
const StudentAccount = require("../models/StudentAccount");

function serializeUser(user) {
  if (!user) return null;
  if (user.role === "admin") {
    return {
      _id: user._id,
      name: user.username,
      email: user.username,
      username: user.username,
      role: "admin",
    };
  }

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: "student",
    status: user.status,
  };
}

async function verifyJWT(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Missing token" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const Model = payload.role === "admin" ? AdminAccount : StudentAccount;
    const user = await Model.findById(payload.sub).lean();
    if (!user) return res.status(401).json({ error: "Invalid token" });

    req.user = serializeUser(user);
    next();
  } catch (_error) {
    res.status(401).json({ error: "Invalid token" });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "Admin only" });
  next();
}

module.exports = {
  verifyJWT,
  requireAdmin,
  serializeUser,
};
