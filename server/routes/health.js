const router = require("express").Router();
const jwt = require("jsonwebtoken");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const AdminAccount = require("../models/AdminAccount");
const Result = require("../models/Result");
const { verifyJWT, requireAdmin } = require("../middleware/auth");

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

router.get("/", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

async function timed(fn) {
  const start = Date.now();
  try {
    const detail = await fn();
    return { status: "ok", responseMs: Date.now() - start, detail };
  } catch (err) {
    return { status: "fail", responseMs: Date.now() - start, error: err.message || String(err) };
  }
}

router.get("/full", verifyJWT, requireAdmin, async (req, res) => {
  const tokenHeader = req.headers.authorization || "";
  const token = tokenHeader.startsWith("Bearer ") ? tokenHeader.slice(7) : null;

  const [adminDb, studentsDb, geminiPro, geminiFlash, jwtCheck] = await Promise.all([
    timed(async () => {
      const count = await AdminAccount.countDocuments();
      return `stepsguidance_admin · admin_accounts: ${count}`;
    }),
    timed(async () => {
      const count = await Result.countDocuments();
      return `stepsguidance_students · results: ${count}`;
    }),
    timed(async () => {
      if (!genAI) throw new Error("GEMINI_API_KEY not configured");
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
      const r = await model.generateContent("Reply with the word OK only");
      const text = (r.response.text() || "").trim();
      return `gemini-2.5-pro · "${text.slice(0, 20)}"`;
    }),
    timed(async () => {
      if (!genAI) throw new Error("GEMINI_API_KEY not configured");
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", tools: [{ googleSearch: {} }] });
      const r = await model.generateContent("Reply with the word OK only");
      const text = (r.response.text() || "").trim();
      return `gemini-2.5-flash · search grounding · "${text.slice(0, 20)}"`;
    }),
    timed(async () => {
      if (!token) throw new Error("No token");
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const expISO = new Date(payload.exp * 1000).toISOString();
      return `Valid · expires ${expISO}`;
    }),
  ]);

  const checks = [
    { name: "MongoDB Admin DB", ...adminDb },
    { name: "MongoDB Students DB", ...studentsDb },
    { name: "Gemini 2.5 Pro", ...geminiPro },
    { name: "Gemini 2.5 Flash (Search Grounding)", ...geminiFlash },
    { name: "JWT Auth", ...jwtCheck },
    { name: "Backend API", status: "ok", responseMs: 0, detail: `Online · uptime ${Math.round(process.uptime())}s` },
  ];

  const overall = checks.every((c) => c.status === "ok") ? "healthy" : "degraded";
  res.json({ overall, checks });
});

module.exports = router;
