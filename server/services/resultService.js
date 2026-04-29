const { GoogleGenerativeAI } = require("@google/generative-ai");
const Question = require("../models/Question");
const Response = require("../models/Response");
const Result = require("../models/Result");
const StudentAccount = require("../models/StudentAccount");
const { sectionTitles } = require("../data/questionBank");

const TRAITS = ["analytical", "creative", "applied", "social", "aiReadiness"];
const GEMINI_MODEL = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

const CAREER_CATALOG = [
  {
    career: "Data Science",
    focus: { analytical: 0.45, creative: 0.1, applied: 0.2, social: 0.05, aiReadiness: 0.2 },
    ugDegrees: ["BSc Data Science", "BTech Computer Science", "BSc Statistics"],
    pgDegrees: ["MSc Data Science", "MS Business Analytics"],
    jobRoles: ["Data Analyst", "Machine Learning Associate", "BI Developer"],
  },
  {
    career: "Product Design",
    focus: { analytical: 0.15, creative: 0.4, applied: 0.2, social: 0.1, aiReadiness: 0.15 },
    ugDegrees: ["Bachelor of Design", "BA Interaction Design", "BDes UX Design"],
    pgDegrees: ["MDes Interaction Design", "MA Human Computer Interaction"],
    jobRoles: ["UX Designer", "Product Designer", "Design Researcher"],
  },
  {
    career: "Mechanical Engineering",
    focus: { analytical: 0.25, creative: 0.1, applied: 0.4, social: 0.05, aiReadiness: 0.2 },
    ugDegrees: ["BTech Mechanical Engineering", "BEng Mechatronics"],
    pgDegrees: ["MEng Robotics", "MS Industrial Engineering"],
    jobRoles: ["Mechanical Design Engineer", "Manufacturing Engineer", "Robotics Technician"],
  },
  {
    career: "Psychology & Counselling",
    focus: { analytical: 0.1, creative: 0.1, applied: 0.1, social: 0.5, aiReadiness: 0.2 },
    ugDegrees: ["BA Psychology", "BSc Psychology"],
    pgDegrees: ["MA Counselling Psychology", "MSc Clinical Psychology"],
    jobRoles: ["Student Counsellor", "Behaviour Analyst", "Wellbeing Coach"],
  },
  {
    career: "Business & Entrepreneurship",
    focus: { analytical: 0.2, creative: 0.15, applied: 0.2, social: 0.2, aiReadiness: 0.25 },
    ugDegrees: ["BBA", "BCom", "Bachelor of Entrepreneurship"],
    pgDegrees: ["MBA", "MSc Management"],
    jobRoles: ["Business Analyst", "Operations Associate", "Startup Founder"],
  },
  {
    career: "Media & Communications",
    focus: { analytical: 0.05, creative: 0.3, applied: 0.1, social: 0.35, aiReadiness: 0.2 },
    ugDegrees: ["BA Journalism", "BA Media Studies", "BA Communication"],
    pgDegrees: ["MA Communication", "MSc Digital Media"],
    jobRoles: ["Content Strategist", "PR Executive", "Community Manager"],
  },
];

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function riskLabel(score) {
  if (score >= 75) return "Strong";
  if (score >= 50) return "Moderate";
  return "Weak";
}

function level(score) {
  if (score >= 67) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

function getBehaviourProfile(answerByQuestionKey) {
  const ambiguitySignals = [
    answerByQuestionKey.get("B::Do you prefer?"),
    answerByQuestionKey.get("B::How do you react when something is unclear?"),
  ].filter(Boolean);
  let ambiguityScore = 50;
  if (ambiguitySignals.includes("open_ended_problems")) ambiguityScore += 25;
  if (ambiguitySignals.includes("try_to_figure_it_out")) ambiguityScore += 20;
  if (ambiguitySignals.includes("wait_for_guidance")) ambiguityScore -= 20;
  if (ambiguitySignals.includes("avoid_it")) ambiguityScore -= 25;

  const disciplineSignals = [
    answerByQuestionKey.get("B::Which describes you better?"),
    answerByQuestionKey.get("B::Do you complete tasks even when they become boring?"),
    answerByQuestionKey.get("B::When a deadline is near you?"),
  ].filter(Boolean);
  let disciplineScore = 50;
  if (disciplineSignals.includes("consistent_and_disciplined")) disciplineScore += 20;
  if (disciplineSignals.includes("yes_always")) disciplineScore += 20;
  if (disciplineSignals.includes("work_consistently_throughout")) disciplineScore += 20;
  if (disciplineSignals.includes("burst_of_energy_then_drop")) disciplineScore -= 20;
  if (disciplineSignals.includes("rarely")) disciplineScore -= 20;
  if (disciplineSignals.includes("rush_at_the_last_minute")) disciplineScore -= 20;

  const riskSignals = [
    answerByQuestionKey.get("D::Would you choose?"),
    answerByQuestionKey.get("D::Are you open to moving abroad for education or work?"),
    answerByQuestionKey.get("D::Are you open to taking an education loan?"),
  ].filter(Boolean);
  let riskScore = 50;
  if (riskSignals.includes("high_risk_path")) riskScore += 20;
  if (riskSignals.includes("yes_eagerly")) riskScore += 15;
  if (riskSignals.includes("yes_if_needed")) riskScore += 8;
  if (riskSignals.includes("yes")) riskScore += 10;
  if (riskSignals.includes("stable_job")) riskScore -= 15;
  if (riskSignals.includes("prefer_to_stay")) riskScore -= 10;
  if (riskSignals.includes("not_at_all")) riskScore -= 15;
  if (riskSignals.includes("no")) riskScore -= 10;

  return {
    ambiguity: level(clamp(ambiguityScore)),
    discipline: level(clamp(disciplineScore)),
    riskAppetite: level(clamp(riskScore)),
  };
}

function getContradictionFlags({ behaviourProfile, traitScores, answerByQuestionKey }) {
  const flags = [];
  if (behaviourProfile.riskAppetite === "Low" && answerByQuestionKey.get("D::Would you choose?") === "high_risk_path") {
    flags.push("Says they want a high-upside path but shows hesitation in other risk decisions.");
  }
  if (traitScores.aiReadinessIndex < 40 && answerByQuestionKey.get("E::How do you feel about working alongside AI tools in your future job?") === "excited") {
    flags.push("Positive toward AI, but current tool usage suggests readiness still needs work.");
  }
  if (behaviourProfile.discipline === "Low" && answerByQuestionKey.get("F::What motivates you to push through difficult tasks?") === "personal_pride") {
    flags.push("Strong self-image around persistence, but work-style answers show inconsistent follow-through.");
  }
  if (traitScores.social >= 75 && answerByQuestionKey.get("B::Do you enjoy working?") === "alone") {
    flags.push("High people-skill signal paired with a strong preference for solo work.");
  }
  return flags;
}

function getCareerMatches(traitScores, behaviourProfile) {
  const scored = CAREER_CATALOG.map((career) => {
    const matchPercent = Math.round(
      (traitScores.analytical * career.focus.analytical) +
      (traitScores.creative * career.focus.creative) +
      (traitScores.applied * career.focus.applied) +
      (traitScores.social * career.focus.social) +
      (traitScores.aiReadinessIndex * career.focus.aiReadiness),
    );
    const behaviourBoost =
      (behaviourProfile.ambiguity === "High" ? 3 : 0) +
      (behaviourProfile.discipline === "High" ? 3 : 0) +
      (behaviourProfile.riskAppetite === "High" ? 2 : 0);
    return { ...career, matchPercent: clamp(matchPercent + behaviourBoost) };
  }).sort((a, b) => b.matchPercent - a.matchPercent);

  return {
    primary: scored[0],
    secondary: scored[1],
    rejected: scored.slice(2).filter((item) => item.matchPercent < 55).map((item) => item.career),
  };
}

async function checkAiRisk(jobTitle) {
  if (!GEMINI_MODEL) {
    return { aiRisk: "at-risk", advice: "Build judgement-heavy and client-facing strengths alongside AI tool fluency." };
  }

  try {
    const model = GEMINI_MODEL.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Reply with JSON only for the job "${jobTitle}":
{"aiRisk":"safe|at-risk|high-risk","advice":"one short sentence"}`;
    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(result.response.text().trim().replace(/^```json|```$/g, "").trim());
    return {
      aiRisk: ["safe", "at-risk", "high-risk"].includes(parsed.aiRisk) ? parsed.aiRisk : "at-risk",
      advice: parsed.advice || "Keep upgrading your workflow with AI and focus on judgement-heavy tasks.",
    };
  } catch (_error) {
    return { aiRisk: "at-risk", advice: "Keep upgrading your workflow with AI and focus on judgement-heavy tasks." };
  }
}

async function buildSummary(student, snapshot) {
  if (!GEMINI_MODEL) {
    return `${student.name} shows strongest fit for ${snapshot.careerFit.primary.career}, with ${snapshot.behaviourProfile.discipline.toLowerCase()} discipline and ${snapshot.behaviourProfile.ambiguity.toLowerCase()} comfort with ambiguity. Focus next on practical exploration, digital fluency, and decision clarity before choosing a degree path.`;
  }

  try {
    const model = GEMINI_MODEL.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
You are a study-abroad career advisor. Write one concise paragraph for a student.
Student name: ${student.name}
Trait scores: ${JSON.stringify(snapshot.traitScores)}
Behaviour profile: ${JSON.stringify(snapshot.behaviourProfile)}
AI readiness: ${snapshot.aiReadinessIndex}
Primary career fit: ${snapshot.careerFit.primary.career} (${snapshot.careerFit.primary.matchPercent}%)
Secondary career fit: ${snapshot.careerFit.secondary.career} (${snapshot.careerFit.secondary.matchPercent}%)
Contradictions: ${snapshot.contradictionFlags.join("; ") || "None"}
Keep it practical, supportive, and candid in under 90 words.
`;
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (_error) {
    return `${student.name} shows strongest fit for ${snapshot.careerFit.primary.career}, with ${snapshot.behaviourProfile.discipline.toLowerCase()} discipline and ${snapshot.behaviourProfile.ambiguity.toLowerCase()} comfort with ambiguity. Focus next on practical exploration, digital fluency, and decision clarity before choosing a degree path.`;
  }
}

function buildQuestionMap(questions) {
  return new Map(questions.map((question) => [String(question._id), question]));
}

function computeSnapshot(student, questions, responseDoc) {
  const questionMap = buildQuestionMap(questions);
  const totals = { analytical: 0, creative: 0, applied: 0, social: 0, aiReadiness: 0 };
  const maxTotals = { analytical: 0, creative: 0, applied: 0, social: 0, aiReadiness: 0 };
  const sectionRollup = new Map();
  const answerByQuestionKey = new Map();

  for (const answer of responseDoc.answers) {
    const question = questionMap.get(String(answer.questionId));
    if (!question) continue;
    const choice = question.choices.find((item) => item.value === answer.selectedValue)
      || question.choices.find((item) => item.allowCustomInput && answer.customAnswer);
    if (!choice) continue;

    answerByQuestionKey.set(`${question.section}::${question.questionText}`, answer.selectedValue);

    const sectionState = sectionRollup.get(question.section) || { total: 0, max: 0 };
    const maxChoiceScore = Math.max(...question.choices.map((item) => TRAITS.reduce((sum, trait) => sum + item.weights[trait], 0)));
    const selectedScore = TRAITS.reduce((sum, trait) => sum + choice.weights[trait], 0);
    sectionState.total += selectedScore;
    sectionState.max += maxChoiceScore;
    sectionRollup.set(question.section, sectionState);

    for (const trait of TRAITS) {
      totals[trait] += choice.weights[trait];
      maxTotals[trait] += Math.max(...question.choices.map((item) => item.weights[trait]));
    }
  }

  const traitScores = {
    analytical: clamp(Math.round((totals.analytical / Math.max(maxTotals.analytical, 1)) * 100)),
    creative: clamp(Math.round((totals.creative / Math.max(maxTotals.creative, 1)) * 100)),
    applied: clamp(Math.round((totals.applied / Math.max(maxTotals.applied, 1)) * 100)),
    social: clamp(Math.round((totals.social / Math.max(maxTotals.social, 1)) * 100)),
    aiReadinessIndex: clamp(Math.round((totals.aiReadiness / Math.max(maxTotals.aiReadiness, 1)) * 100)),
  };

  const behaviourProfile = getBehaviourProfile(answerByQuestionKey);
  const sectionScores = Object.keys(sectionTitles).map((section) => {
    const state = sectionRollup.get(section) || { total: 0, max: 1 };
    const score = clamp(Math.round((state.total / Math.max(state.max, 1)) * 100));
    return { section, score, fit: riskLabel(score) };
  });

  const contradictionFlags = getContradictionFlags({ behaviourProfile, traitScores, answerByQuestionKey });
  const careerFit = getCareerMatches(traitScores, behaviourProfile);

  return {
    userId: student._id,
    generatedAt: new Date(),
    traitScores: {
      analytical: traitScores.analytical,
      creative: traitScores.creative,
      applied: traitScores.applied,
      social: traitScores.social,
    },
    behaviourProfile,
    aiReadinessIndex: traitScores.aiReadinessIndex,
    sectionScores,
    contradictionFlags,
    careerFit,
  };
}

async function enrichCareerFit(careerFit) {
  const enrichEntry = async (entry) => {
    const jobRoles = await Promise.all(entry.jobRoles.map(async (title) => {
      const risk = await checkAiRisk(title);
      return { title, ...risk };
    }));
    return {
      career: entry.career,
      matchPercent: entry.matchPercent,
      ugDegrees: entry.ugDegrees,
      pgDegrees: entry.pgDegrees,
      jobRoles,
    };
  };

  return {
    primary: await enrichEntry(careerFit.primary),
    secondary: await enrichEntry(careerFit.secondary),
    rejected: careerFit.rejected,
  };
}

async function generateResultForUser(userId) {
  const [student, latestResponse, questions] = await Promise.all([
    StudentAccount.findById(userId),
    Response.findOne({ userId }).sort({ submittedAt: -1 }).lean(),
    Question.find().sort({ order: 1 }).lean(),
  ]);

  if (!student) {
    const error = new Error("Student not found");
    error.status = 404;
    throw error;
  }

  if (!latestResponse) {
    const error = new Error("No responses submitted yet");
    error.status = 400;
    throw error;
  }

  const snapshot = computeSnapshot(student, questions, latestResponse);
  snapshot.careerFit = await enrichCareerFit(snapshot.careerFit);
  snapshot.aiSuggestionSummary = await buildSummary(student, snapshot);

  const saved = await Result.findOneAndUpdate(
    { userId: student._id },
    snapshot,
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).lean();

  return { ...saved, userName: student.name };
}

module.exports = {
  generateResultForUser,
};
