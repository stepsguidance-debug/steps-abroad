const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const { connectDatabases } = require("./db");
const {
  GEMINI_MODEL_PRO,
  GEMINI_MODEL_FLASH,
  GEMINI_MODEL_SUMMARY,
  GEMINI_QUEUE_DELAY_MS,
  GEMINI_QUEUE_MAX_SIZE,
} = require("./services/resultService");

const authRoutes     = require("./routes/auth");
const adminRoutes    = require("./routes/admin");
const questionRoutes = require("./routes/questions");
const responseRoutes = require("./routes/responses");
const resultRoutes   = require("./routes/results");
const healthRoutes   = require("./routes/health");

// ─────────────────────────────────────────────
//  App
// ─────────────────────────────────────────────
const app = express();

const allowedOrigins = [
  ...(process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(",") : []),
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",") : []),
]
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow server-to-server calls (no origin) and listed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from: ${origin}`);
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Handle preflight requests for all routes
app.options("*", cors());

// ─────────────────────────────────────────────
//  Body parser
// ─────────────────────────────────────────────
app.use(express.json({ limit: "1mb" }));

// ─────────────────────────────────────────────
//  Lazy DB bootstrap
//  On Vercel each function invocation is cold.
//  We connect once per instance and reuse the
//  connection for subsequent requests via the
//  dbReady flag.
// ─────────────────────────────────────────────
let dbReady = false;

async function bootstrap() {
  if (dbReady) return;
  const { admin, students } = await connectDatabases();
  console.log(`Mongo connected: ${admin}, ${students}`);
  console.log(`Gemini models: pro=${GEMINI_MODEL_PRO}, flash=${GEMINI_MODEL_FLASH}, summary=${GEMINI_MODEL_SUMMARY}`);
  console.log(`Queue config: delay=${GEMINI_QUEUE_DELAY_MS}ms, maxSize=${GEMINI_QUEUE_MAX_SIZE}`);
  dbReady = true;
}

// Ensure DB is ready before every request
app.use(async (_req, _res, next) => {
  try {
    // Allow basic health ping even when DB is down/misconfigured.
    // Everything else (auth, admin, questions, responses, results) requires DB.
    const url = _req.originalUrl || "";
    if (url === "/" || url.startsWith("/api/health")) {
      return next();
    }

    await bootstrap();
    next();
  } catch (err) {
    console.error("DB bootstrap failed:", err.message);
    next(err);
  }
});

// ─────────────────────────────────────────────
//  Root health ping (no auth required)
// ─────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "steps-guidance-api",
    env: process.env.NODE_ENV || "development",
  });
});

// ─────────────────────────────────────────────
//  Routes
// ─────────────────────────────────────────────
app.use("/api/auth",      authRoutes);
app.use("/api/admin",     adminRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/responses", responseRoutes);
app.use("/api/results",   resultRoutes);
app.use("/api/health",    healthRoutes);

// ─────────────────────────────────────────────
//  404 handler
// ─────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ─────────────────────────────────────────────
//  Global error handler
// ─────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err.message || err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

// ─────────────────────────────────────────────
//  Local development server
//  On Vercel this block is skipped entirely.
//  Vercel calls module.exports = app directly.
// ─────────────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`\nAPI listening on port ${PORT}`);
    console.log("Health check path: /api/health\n");
    bootstrap().catch((error) => {
      console.error("DB bootstrap failed on startup (server still running):", error?.message || error);
    });
  });
  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use. Stop the running process or set a different PORT in .env.`);
      process.exit(1);
    }
    console.error("Server listen error:", error.message || error);
    process.exit(1);
  });
}

// ─────────────────────────────────────────────
//  Vercel serverless export
//  Vercel imports this file and calls the app
//  directly as a serverless function handler.
// ─────────────────────────────────────────────
module.exports = app;
