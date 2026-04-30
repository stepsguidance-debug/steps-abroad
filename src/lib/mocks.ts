import type { Question, Result, Student, User } from "./types";

export const MOCK_ADMIN: User = {
  _id: "admin-1",
  name: "admin",
  email: "admin",
  role: "admin",
};

export const MOCK_STUDENTS: Student[] = [
  { _id: "s1", name: "Aarav Sharma", email: "aarav@example.com", role: "student", status: "answered", aiReadiness: 82 },
  { _id: "s2", name: "Diya Patel", email: "diya@example.com", role: "student", status: "answered", aiReadiness: 67 },
  { _id: "s3", name: "Rohan Verma", email: "rohan@example.com", role: "student", status: "pending", aiReadiness: null },
  { _id: "s4", name: "Sara Khan", email: "sara@example.com", role: "student", status: "pending", aiReadiness: null },
  { _id: "s5", name: "Kabir Singh", email: "kabir@example.com", role: "student", status: "answered", aiReadiness: 74 },
  { _id: "s6", name: "Meera Iyer", email: "meera@example.com", role: "student", status: "pending", aiReadiness: null },
];

const choice = (label: string, value: string): Question["choices"][number] => ({
  label,
  value,
  weights: { analytical: 5, creative: 5, applied: 5, social: 5, aiReadiness: 5 },
});

export const MOCK_QUESTIONS: Question[] = [
  {
    _id: "A-1",
    section: "A",
    sectionTitle: "Academic & Cognitive Signals",
    questionText: "Which subjects did you consistently score highest in with least effort?",
    type: "mcq",
    layer: "L1",
    choices: [
      choice("Sciences", "sciences"),
      choice("Commerce", "commerce"),
      choice("Arts", "arts"),
      choice("Languages", "languages"),
    ],
    order: 1,
  },
  {
    _id: "B-1",
    section: "B",
    sectionTitle: "Behaviour & Work Style",
    questionText: "Do you prefer?",
    type: "forced-choice",
    layer: "L2",
    choices: [
      choice("Clear instructions", "clear_instructions"),
      choice("Open-ended problems", "open_ended_problems"),
    ],
    order: 2,
  },
  {
    _id: "E-1",
    section: "E",
    sectionTitle: "AI Awareness & Adaptability",
    questionText: "How do you feel about working alongside AI tools in your future job?",
    type: "mcq",
    layer: "L5",
    choices: [
      choice("Excited", "excited"),
      choice("Neutral", "neutral"),
      choice("Worried", "worried"),
      choice("Strongly against", "strongly_against"),
    ],
    order: 3,
  },
];

const buildResult = (userId: string, userName: string, readiness: number): Result => ({
  _id: `r-${userId}`,
  userId,
  userName,
  aiReadinessIndex: readiness,
  traitScores: {
    analytical: readiness >= 75 ? 82 : 64,
    creative: readiness >= 75 ? 71 : 58,
    applied: readiness >= 75 ? 78 : 60,
    social: readiness >= 75 ? 69 : 72,
  },
  behaviourProfile: readiness >= 75
    ? { ambiguity: "High", discipline: "High", riskAppetite: "Medium" }
    : { ambiguity: "Medium", discipline: "Medium", riskAppetite: "Low" },
  sectionScores: [
    { section: "A", score: readiness >= 75 ? 84 : 62, fit: readiness >= 75 ? "Strong" : "Moderate" },
    { section: "B", score: readiness >= 75 ? 72 : 55, fit: "Moderate" },
    { section: "C", score: readiness >= 75 ? 80 : 58, fit: readiness >= 75 ? "Strong" : "Moderate" },
    { section: "D", score: readiness >= 75 ? 68 : 76, fit: readiness >= 75 ? "Moderate" : "Strong" },
    { section: "E", score: 70, fit: "Moderate" },
    { section: "F", score: readiness >= 75 ? 82 : 65, fit: readiness >= 75 ? "Strong" : "Moderate" },
    { section: "G", score: readiness >= 75 ? 86 : 60, fit: readiness >= 75 ? "Strong" : "Moderate" },
  ],
  contradictionFlags: readiness >= 75 ? [] : ["Strong people skills, but current choices still avoid ambiguity-heavy situations."],
  careerFit: {
    primary: {
      career: "AI Product Manager",
      matchPercent: readiness >= 75 ? 86 : 68,
      ugDegrees: ["BSc Computer Science", "BBA"],
      pgDegrees: ["MSc Product Management"],
      jobRoles: [
        {
          title: "AI Product Manager",
          aiRisk: "safe",
          riskLabel: "AI-resilient",
          whatAiIsDoing: "AI copilots help with synthesis and roadmap drafts, but they do not replace product judgement or stakeholder alignment.",
          whatStudentShouldDo: "Build strong product thinking, customer discovery, and AI workflow fluency.",
        },
        {
          title: "Solutions Architect",
          aiRisk: "at-risk",
          riskLabel: "Watch closely",
          whatAiIsDoing: "AI is automating parts of solution design, documentation, and reference architecture generation.",
          whatStudentShouldDo: "Strengthen client discovery, systems trade-off thinking, and integration skills.",
        },
      ],
    },
    secondary: {
      career: "UX Researcher",
      matchPercent: readiness >= 75 ? 74 : 66,
      ugDegrees: ["BA Psychology", "BDes UX Design"],
      pgDegrees: ["MSc Human Computer Interaction"],
      jobRoles: [
        {
          title: "UX Researcher",
          aiRisk: "safe",
          riskLabel: "AI-resilient",
          whatAiIsDoing: "AI can summarize interview notes and generate draft insights, but it cannot fully replace human interpretation of context.",
          whatStudentShouldDo: "Invest in qualitative research, synthesis, and experimentation design.",
        },
      ],
    },
    rejected: [
      {
        career: "Purely repetitive back-office operations",
        matchPercent: 28,
        reason: "The profile leans toward roles with more judgement and adaptability than repetitive process work.",
      },
      {
        career: "Routine data entry",
        matchPercent: 24,
        reason: "The student shows stronger long-term fit for analytical growth paths than low-complexity clerical tasks.",
      },
      {
        career: "Highly isolated archival work",
        matchPercent: 32,
        reason: "The current profile benefits more from dynamic environments than narrow, low-variation workflows.",
      },
    ],
  },
  aiSuggestionSummary: readiness >= 75
    ? "You combine sharp analysis with enough adaptability to thrive in fast-changing, AI-enabled roles. Keep validating your fit through real projects and degree choices that preserve optionality."
    : "Your profile is promising, especially where teamwork and consistency matter. The next step is building more evidence through projects, tool fluency, and clearer career experiments.",
  generatedAt: new Date().toISOString(),
});

export const MOCK_RESULTS: Record<string, Result> = {
  s1: buildResult("s1", "Aarav Sharma", 82),
  s2: buildResult("s2", "Diya Patel", 67),
  s5: buildResult("s5", "Kabir Singh", 74),
  "current-student": buildResult("current-student", "Demo Student", 78),
};
