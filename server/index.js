// require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
// const express = require("express");
// const cors = require("cors");
// const { connectDatabases } = require("./db");
// const {
//   GEMINI_MODEL_PRO,
//   GEMINI_MODEL_FLASH,
//   GEMINI_MODEL_SUMMARY,
//   GEMINI_QUEUE_DELAY_MS,
//   GEMINI_QUEUE_MAX_SIZE,
// } = require("./services/resultService");

// const authRoutes = require("./routes/auth");
// const adminRoutes = require("./routes/admin");
// const questionRoutes = require("./routes/questions");
// const responseRoutes = require("./routes/responses");
// const resultRoutes = require("./routes/results");
// const healthRoutes = require("./routes/health");

// const app = express();

// app.use(cors({
//   origin: (process.env.CLIENT_ORIGIN || "http://localhost:8080").split(","),
//   credentials: true,
// }));
// app.use(express.json({ limit: "1mb" }));

// app.get("/", (_req, res) => {
//   res.json({ ok: true, service: "steps-guidance-api" });
// });

// app.use("/api/auth", authRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api/questions", questionRoutes);
// app.use("/api/responses", responseRoutes);
// app.use("/api/results", resultRoutes);
// app.use("/api/health", healthRoutes);

// app.use((err, _req, res, _next) => {
//   console.error(err);
//   res.status(err.status || 500).json({ error: err.message || "Server error" });
// });

// const PORT = process.env.PORT || 5000;

// connectDatabases().then(({ admin, students }) => {
//   console.log(`Mongo connected: ${admin}, ${students}`);
//   console.log(`Gemini models: pro=${GEMINI_MODEL_PRO}, flash=${GEMINI_MODEL_FLASH}, summary=${GEMINI_MODEL_SUMMARY}`);
//   console.log(`Queue config: delay=${GEMINI_QUEUE_DELAY_MS}ms, maxSize=${GEMINI_QUEUE_MAX_SIZE}`);
//   app.listen(PORT, () => console.log(`API listening on :${PORT}`));
// }).catch((error) => {
//   console.error("Mongo connection failed", error);
//   process.exit(1);
// });
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

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

// ─────────────────────────────────────────────
//  CORS
//  Allows both local dev (port 8080 / 5173)
//  and the live Vercel frontend.
//  Add any extra origins to CLIENT_ORIGIN or
//  FRONTEND_URL in .env separated by commas.
// ─────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:5173",
  "http://localhost:3000",
  "https://steps-abroad.vercel.app",
  ...(process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(",") : []),
  ...(process.env.FRONTEND_URL  ? process.env.FRONTEND_URL.split(",")  : []),
].filter(Boolean);

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
  bootstrap()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`\nAPI listening on http://localhost:${PORT}`);
        console.log(`Health check: http://localhost:${PORT}/api/health\n`);
      });
    })
    .catch((error) => {
      console.error("Failed to start server:", error);
      process.exit(1);
    });
}

// ─────────────────────────────────────────────
//  Vercel serverless export
//  Vercel imports this file and calls the app
//  directly as a serverless function handler.
// ─────────────────────────────────────────────
module.exports = app;