const router = require("express").Router();
const jwt = require("jsonwebtoken");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const AdminAccount = require("../models/AdminAccount");
const Result = require("../models/Result");
const { verifyJWT, requireAdmin } = require("../middleware/auth");
const { adminDbName, studentDbName } = require("../db");
const {
  GEMINI_MODEL_PRO,
  GEMINI_MODEL_FLASH,
  GEMINI_MODEL_SUMMARY,
  GEMINI_QUEUE_DELAY_MS,
  GEMINI_QUEUE_MAX_SIZE,
} = require("../services/resultService");

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
      return `${adminDbName} · admin_accounts: ${count}`;
    }),
    timed(async () => {
      const count = await Result.countDocuments();
      return `${studentDbName} · results: ${count}`;
    }),
    timed(async () => {
      if (!genAI) throw new Error("GEMINI_API_KEY not configured");
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL_PRO });
      const r = await model.generateContent("Reply with the word OK only");
      const text = (r.response.text() || "").trim();
      return `${GEMINI_MODEL_PRO} · "${text.slice(0, 20)}"`;
    }),
    timed(async () => {
      if (!genAI) throw new Error("GEMINI_API_KEY not configured");
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL_FLASH, tools: [{ googleSearch: {} }] });
      const r = await model.generateContent("Reply with the word OK only");
      const text = (r.response.text() || "").trim();
      return `${GEMINI_MODEL_FLASH} · search grounding · "${text.slice(0, 20)}"`;
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
    { name: `Gemini Pro (${GEMINI_MODEL_PRO})`, ...geminiPro },
    { name: `Gemini Flash (${GEMINI_MODEL_FLASH})`, ...geminiFlash },
    { name: "JWT Auth", ...jwtCheck },
    { name: "Backend API", status: "ok", responseMs: 0, detail: `Online · port ${process.env.PORT || 5000} · uptime ${Math.round(process.uptime())}s` },
  ];

  const overall = checks.every((c) => c.status === "ok") ? "healthy" : "degraded";
  res.json({
    overall,
    checks,
    geminiModelPro: GEMINI_MODEL_PRO,
    geminiModelFlash: GEMINI_MODEL_FLASH,
    geminiModelSummary: GEMINI_MODEL_SUMMARY,
    geminiQueueDelayMs: GEMINI_QUEUE_DELAY_MS,
    geminiQueueMaxSize: GEMINI_QUEUE_MAX_SIZE,
    dbAdmin: adminDbName,
    dbStudents: studentDbName,
    port: Number(process.env.PORT || 5000),
  });
});

module.exports = router;
