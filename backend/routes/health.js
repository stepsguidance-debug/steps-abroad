const router = require("express").Router();
const jwt = require("jsonwebtoken");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const AdminAccount = require("../models/AdminAccount");
const Result = require("../models/Result");
const { adminDbName, studentDbName } = require("../db");
const {
  GEMINI_MODEL_PRO,
  GEMINI_MODEL_PRO_FALLBACK,
  GEMINI_MODEL_FLASH,
  GEMINI_MODEL_SUMMARY,
  GEMINI_QUEUE_DELAY_MS,
  GEMINI_QUEUE_MAX_SIZE,
} = require("../services/resultService");

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

function getProFallbackCandidates(primaryModel, fallbackModel) {
  const configured = String(fallbackModel || "").trim();
  return configured && configured !== primaryModel ? [configured] : [];
}

router.get("/", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

function verifyHealthAdminJWT(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Missing token" });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload?.role !== "admin") {
      return res.status(403).json({ error: "Admin only" });
    }
    req.healthJwtPayload = payload;
    next();
  } catch (_err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

async function timed(fn) {
  const start = Date.now();
  try {
    const detail = await fn();
    return { status: "ok", responseMs: Date.now() - start, detail };
  } catch (err) {
    return { status: "fail", responseMs: Date.now() - start, error: err.message || String(err) };
  }
}

function normalizeCheck(check) {
  const status = check?.status === "ok" ? "ok" : "fail";
  const responseMs = Number.isFinite(check?.responseMs) ? check.responseMs : 0;
  const normalized = { ...check, status, responseMs };
  if (status === "ok") {
    normalized.detail = String(check?.detail || "Connected");
    delete normalized.error;
  } else {
    normalized.error = String(check?.error || "Connection check failed");
    if (!normalized.detail) normalized.detail = "Not connected";
  }
  return normalized;
}

async function checkGeminiProWithFallback() {
  const start = Date.now();
  if (!genAI) {
    return {
      status: "fail",
      responseMs: Date.now() - start,
      error: "GEMINI_API_KEY not configured",
      activeModel: GEMINI_MODEL_PRO,
      replaced: false,
    };
  }

  const tryModel = async (modelName) => {
    const model = genAI.getGenerativeModel({ model: modelName });
    const r = await model.generateContent("Reply with the word OK only");
    const text = (r.response.text() || "").trim();
    return `${modelName} · "${text.slice(0, 20)}"`;
  };

  try {
    const detail = await tryModel(GEMINI_MODEL_PRO);
    return {
      status: "ok",
      responseMs: Date.now() - start,
      detail,
      activeModel: GEMINI_MODEL_PRO,
      replaced: false,
    };
  } catch (err) {
    const fallbackCandidates = getProFallbackCandidates(
      GEMINI_MODEL_PRO,
      GEMINI_MODEL_PRO_FALLBACK
    );
    if (fallbackCandidates.length === 0) {
      return {
        status: "fail",
        responseMs: Date.now() - start,
        error: err.message || String(err),
        activeModel: GEMINI_MODEL_PRO,
        replaced: false,
      };
    }

    let lastFallbackErr = err;
    for (const modelName of fallbackCandidates) {
      try {
        const detail = await tryModel(modelName);
        return {
          status: "ok",
          responseMs: Date.now() - start,
          detail: `${detail} (fallback from ${GEMINI_MODEL_PRO})`,
          activeModel: modelName,
          replaced: true,
        };
      } catch (fallbackErr) {
        lastFallbackErr = fallbackErr;
      }
    }

    return {
      status: "fail",
      responseMs: Date.now() - start,
      error: lastFallbackErr.message || String(lastFallbackErr),
      activeModel: GEMINI_MODEL_PRO,
      replaced: false,
    };
  }
}

router.get("/full", verifyHealthAdminJWT, async (req, res) => {
  const tokenHeader = req.headers.authorization || "";
  const token = tokenHeader.startsWith("Bearer ") ? tokenHeader.slice(7) : null;

  const [adminDb, studentsDb, geminiPro, geminiFlash, jwtCheck] = await Promise.all([
    timed(async () => {
      const countSnap = await AdminAccount.collection().count().get();
      return `Firestore · admin_accounts: ${countSnap.data().count}`;
    }),
    timed(async () => {
      const countSnap = await Result.collection().count().get();
      return `Firestore · results: ${countSnap.data().count}`;
    }),
    checkGeminiProWithFallback(),
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
    normalizeCheck({ name: "Firestore Admin DB", ...adminDb }),
    normalizeCheck({ name: "Firestore Students DB", ...studentsDb }),
    {
      name: geminiPro.replaced
        ? `Gemini Pro (${GEMINI_MODEL_PRO}) -> ${geminiPro.activeModel}`
        : `Gemini Pro (${geminiPro.activeModel})`,
      ...normalizeCheck(geminiPro),
    },
    normalizeCheck({ name: `Gemini Flash (${GEMINI_MODEL_FLASH})`, ...geminiFlash }),
    normalizeCheck({ name: "JWT Auth", ...jwtCheck }),
    normalizeCheck({ name: "Backend API", status: "ok", responseMs: 0, detail: `Online · port ${process.env.PORT || 5000} · uptime ${Math.round(process.uptime())}s` }),
  ];

  const issues = checks
    .filter((c) => c.status !== "ok")
    .map((c) => ({ name: c.name, error: c.error || "Connection check failed" }));
  res.json({
    overall: "healthy",
    hasIssues: issues.length > 0,
    issues,
    checks,
    geminiModelPro: GEMINI_MODEL_PRO,
    geminiModelProFallback: GEMINI_MODEL_PRO_FALLBACK,
    geminiModelProActive: geminiPro.activeModel,
    geminiModelProReplaced: geminiPro.replaced,
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
