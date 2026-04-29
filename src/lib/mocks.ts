// Realistic mock fixtures used when VITE_API_BASE_URL is not set.
import type { Question, Result, Student, User } from "./types";

export const MOCK_ADMIN: User = {
  _id: "admin-1",
  name: "Admin",
  email: "admin@stepsguidance.com",
  role: "admin",
};

export const MOCK_STUDENTS: Student[] = [
  { _id: "s1", name: "Aarav Sharma",   email: "aarav@example.com",   role: "student", status: "completed", aiReadiness: 82 },
  { _id: "s2", name: "Diya Patel",     email: "diya@example.com",    role: "student", status: "completed", aiReadiness: 67 },
  { _id: "s3", name: "Rohan Verma",    email: "rohan@example.com",   role: "student", status: "in_progress", aiReadiness: null },
  { _id: "s4", name: "Sara Khan",      email: "sara@example.com",    role: "student", status: "pending",    aiReadiness: null },
  { _id: "s5", name: "Kabir Singh",    email: "kabir@example.com",   role: "student", status: "completed", aiReadiness: 74 },
  { _id: "s6", name: "Meera Iyer",     email: "meera@example.com",   role: "student", status: "pending",    aiReadiness: null },
];

const SECTIONS: Array<{ key: string; title: string }> = [
  { key: "A", title: "Cognitive & Analytical Reasoning" },
  { key: "B", title: "Creative & Conceptual Thinking" },
  { key: "C", title: "Applied Problem Solving" },
  { key: "D", title: "Social & Communication Skills" },
  { key: "E", title: "Self Perception & Motivation" },
  { key: "F", title: "Behavioural Consistency" },
  { key: "G", title: "Career Aspirations & AI Awareness" },
];

const SAMPLE_TEXTS: Record<string, string[]> = {
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

function buildQuestions(): Question[] {
  const out: Question[] = [];
  let order = 1;
  SECTIONS.forEach((s) => {
    SAMPLE_TEXTS[s.key].forEach((text, idx) => {
      const isMcq = idx % 3 === 0;
      out.push({
        _id: `${s.key}-${idx + 1}`,
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
  });
  // Pad to 50 with extra scale items in section G
  while (out.length < 50) {
    out.push({
      _id: `G-extra-${out.length}`,
      section: "G",
      sectionTitle: "Career Aspirations & AI Awareness",
      text: `I am curious about how my chosen career will evolve in the next 10 years. (Extra ${out.length - 42})`,
      type: "scale",
      order: order++,
    });
  }
  return out;
}

export const MOCK_QUESTIONS: Question[] = buildQuestions();

const buildResult = (userId: string, name: string, readiness: number): Result => ({
  _id: `r-${userId}`,
  userId,
  userName: name,
  aiReadinessIndex: readiness,
  traitScores: {
    Analytical: readiness >= 75 ? 82 : 64,
    Creative: readiness >= 75 ? 71 : 58,
    Applied: readiness >= 75 ? 78 : 60,
    Social: readiness >= 75 ? 69 : 72,
  },
  behaviourProfile: readiness >= 75
    ? "Strategic Builder — analytical, hands-on and resilient."
    : "Empathic Collaborator — people-first with steady follow-through.",
  sectionScores: [
    { section: "A", title: "Cognitive & Analytical", score: readiness >= 75 ? 84 : 62, fit: readiness >= 75 ? "Strong" : "Moderate" },
    { section: "B", title: "Creative & Conceptual",  score: readiness >= 75 ? 72 : 55, fit: "Moderate" },
    { section: "C", title: "Applied Problem Solving", score: readiness >= 75 ? 80 : 58, fit: readiness >= 75 ? "Strong" : "Moderate" },
    { section: "D", title: "Social & Communication", score: readiness >= 75 ? 68 : 76, fit: readiness >= 75 ? "Moderate" : "Strong" },
    { section: "E", title: "Self Perception",        score: 70, fit: "Moderate" },
    { section: "F", title: "Behavioural Consistency", score: readiness >= 75 ? 82 : 65, fit: readiness >= 75 ? "Strong" : "Moderate" },
    { section: "G", title: "Career Aspirations & AI", score: readiness >= 75 ? 86 : 60, fit: readiness >= 75 ? "Strong" : "Moderate" },
  ],
  contradictionFlags: readiness >= 75
    ? []
    : [
        { area: "Self perception vs behaviour", note: "Rates self as highly creative but consistently picks safe, structured options." },
      ],
  careerFit: {
    primary: [
      {
        title: "AI Product Manager",
        ug: "BSc Computer Science",
        pg: "MSc AI Product Management",
        roles: ["AI Product Manager", "Solutions Architect (AI)", "Technical Program Manager"],
        aiRisk: "low",
        advice: "Hybrid technical + human role, hard to automate.",
      },
      {
        title: "Data Scientist",
        ug: "BSc Statistics / CS",
        pg: "MSc Data Science",
        roles: ["Data Scientist", "ML Engineer", "Decision Scientist"],
        aiRisk: "medium",
        advice: "Routine modelling is automating; focus on causal + applied work.",
      },
    ],
    secondary: [
      {
        title: "UX Researcher",
        ug: "BA Psychology / Design",
        pg: "MSc Human-Computer Interaction",
        roles: ["UX Researcher", "Service Designer", "Design Strategist"],
        aiRisk: "low",
        advice: "Human insight remains central.",
      },
    ],
  },
  aiSummary:
    readiness >= 75
      ? "You combine sharp analytical reasoning with a hands-on, build-first instinct. Lean into roles where you translate AI capabilities into real products."
      : "You're a strong collaborator with steady self-discipline. Strengthen your analytical edge with a structured technical course to widen your career options.",
  generatedAt: new Date().toISOString(),
});

export const MOCK_RESULTS: Record<string, Result> = {
  s1: buildResult("s1", "Aarav Sharma", 82),
  s2: buildResult("s2", "Diya Patel", 67),
  s5: buildResult("s5", "Kabir Singh", 74),
  // current student demo result
  "current-student": buildResult("current-student", "Demo Student", 78),
};
