// One-time seed: creates the admin account and the 50-question bank.
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Question = require("../models/Question");

const SECTIONS = [
  { key: "A", title: "Cognitive & Analytical Reasoning" },
  { key: "B", title: "Creative & Conceptual Thinking" },
  { key: "C", title: "Applied Problem Solving" },
  { key: "D", title: "Social & Communication Skills" },
  { key: "E", title: "Self Perception & Motivation" },
  { key: "F", title: "Behavioural Consistency" },
  { key: "G", title: "Career Aspirations & AI Awareness" },
];

const ITEMS = {
  A: [
    "When given a complex problem, I break it into smaller parts before solving.",
    "I enjoy puzzles that require step-by-step logical reasoning.",
    "I quickly spot patterns in numbers or sequences.",
    "I prefer analysing data over relying on intuition.",
    "I can hold multiple variables in my head while solving a problem.",
    "I double-check my reasoning before drawing a conclusion.",
    "I find it easy to compare trade-offs between two options.",
    "I enjoy debugging or fixing things that don't work as expected.",
  ],
  B: [
    "I often come up with ideas that others find unusual.",
    "I enjoy combining concepts from different fields.",
    "I prefer open-ended problems over fixed-answer ones.",
    "I sketch, doodle or visualise ideas before committing to them.",
    "I'm comfortable proposing ideas even when they might fail.",
    "I see possibilities where others see obstacles.",
    "I enjoy redesigning everyday objects to work better.",
  ],
  C: [
    "I prefer learning by building real things over reading theory.",
    "I'm comfortable using tools, equipment or software hands-on.",
    "I learn fastest when I can experiment and iterate.",
    "I enjoy turning a rough plan into a working prototype.",
    "When something breaks, I try to fix it myself first.",
    "I'd rather demo a working feature than describe it on paper.",
    "I keep notes of what worked and what didn't in past projects.",
  ],
  D: [
    "I find it easy to explain technical ideas to non-technical people.",
    "I enjoy working in a team more than working alone.",
    "I'm comfortable presenting in front of a group.",
    "I listen carefully before responding in a discussion.",
    "I can sense when a teammate is uncomfortable and adjust.",
    "I'd rather collaborate on a hard problem than solve it solo.",
    "I write clear, well-structured messages.",
  ],
  E: [
    "I know what kind of work energises me.",
    "I set my own goals without needing external pressure.",
    "I bounce back quickly after a setback.",
    "I'm honest about my weaknesses.",
    "I keep going on long projects even when motivation dips.",
    "I'm clear about what I want my career to look like in 5 years.",
    "I take feedback seriously and act on it.",
  ],
  F: [
    "My friends would describe me the same way I describe myself.",
    "My actions usually match my stated values.",
    "I behave the same in public as I do in private.",
    "I follow through on commitments I make to myself.",
    "I am consistent in how I treat people.",
    "I keep promises even when it's inconvenient.",
    "I rarely contradict myself when explaining a decision.",
  ],
  G: [
    "I have thought carefully about which careers AI may replace.",
    "I prefer careers where human judgement is hard to automate.",
    "I'm willing to keep learning new tools throughout my career.",
    "I'd rather work with AI than compete with it.",
    "I want a career that combines technical and human skills.",
    "I'm open to studying abroad to access better opportunities.",
    "I'd choose meaningful work over a slightly higher salary.",
  ],
};

function buildQuestions() {
  const out = [];
  let order = 1;
  for (const s of SECTIONS) {
    ITEMS[s.key].forEach((text, idx) => {
      const isMcq = idx % 3 === 0;
      out.push({
        section: s.key,
        sectionTitle: s.title,
        text,
        type: isMcq ? "mcq" : "scale",
        options: isMcq
          ? ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"]
          : undefined,
        order: order++,
      });
    });
  }
  while (out.length < 50) {
    out.push({
      section: "G",
      sectionTitle: "Career Aspirations & AI Awareness",
      text: `I am curious about how my chosen career will evolve in the next 10 years. (Extra ${out.length - 42})`,
      type: "scale",
      order: order++,
    });
  }
  return out;
}

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected. Seeding…");

  const adminEmail = "admin@stepsguidance.com";
  const adminPassword = "Admin123!";
  const exists = await User.findOne({ email: adminEmail });
  if (!exists) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await User.create({ name: "Admin", email: adminEmail, passwordHash, role: "admin", status: "completed" });
    console.log(`Admin created: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log("Admin already exists, skipping.");
  }

  const qCount = await Question.countDocuments();
  if (qCount === 0) {
    await Question.insertMany(buildQuestions());
    console.log(`Inserted ${await Question.countDocuments()} questions.`);
  } else {
    console.log(`Question bank already has ${qCount} questions, skipping.`);
  }

  await mongoose.disconnect();
  console.log("Done.");
})().catch((e) => { console.error(e); process.exit(1); });
