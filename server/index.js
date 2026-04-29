require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const questionRoutes = require("./routes/questions");
const responseRoutes = require("./routes/responses");
const resultRoutes = require("./routes/results");

const app = express();

app.use(cors({
  origin: (process.env.CLIENT_ORIGIN || "http://localhost:8080").split(","),
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => res.json({ ok: true, service: "steps-guidance-api" }));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/responses", responseRoutes);
app.use("/api/results", resultRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log("Mongo connected");
  app.listen(PORT, () => console.log(`API listening on :${PORT}`));
}).catch((e) => {
  console.error("Mongo connection failed", e);
  process.exit(1);
});
