// const { GoogleGenerativeAI } = require("@google/generative-ai");
// const Question = require("../models/Question");
// const Response = require("../models/Response");
// const Result = require("../models/Result");
// const StudentAccount = require("../models/StudentAccount");
// const { sectionTitles } = require("../data/questionBank");

// const TRAITS = ["analytical", "creative", "applied", "social", "aiReadiness"];
// const GEMINI_MODEL = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
// const EDUCATION_LEVEL_QUESTION = "What is your highest completed qualification?";

// const CAREER_CATALOG = [
//   {
//     career: "Data Science",
//     focus: { analytical: 0.45, creative: 0.1, applied: 0.2, social: 0.05, aiReadiness: 0.2 },
//     ugDegrees: ["BSc Data Science", "BTech Computer Science", "BSc Statistics"],
//     pgDegrees: ["MSc Data Science", "MS Business Analytics"],
//     advancedPgDegrees: ["Executive MSc Analytics", "MBA Business Analytics", "Specialist MSc Applied AI"],
//     jobRoles: ["Data Analyst", "Machine Learning Associate", "BI Developer"],
//     rejectedReason: "Low analytical depth or limited evidence of structured problem solving makes this path a weak fit right now.",
//   },
//   {
//     career: "Product Design",
//     focus: { analytical: 0.15, creative: 0.4, applied: 0.2, social: 0.1, aiReadiness: 0.15 },
//     ugDegrees: ["Bachelor of Design", "BA Interaction Design", "BDes UX Design"],
//     pgDegrees: ["MDes Interaction Design", "MA Human Computer Interaction"],
//     advancedPgDegrees: ["MDes Design Systems", "Executive MA Service Design", "Specialist Masters in UX Strategy"],
//     jobRoles: ["UX Designer", "Product Designer", "Design Researcher"],
//     rejectedReason: "This path needs stronger creative evidence and user-centred experimentation than the current profile shows.",
//   },
//   {
//     career: "Mechanical Engineering",
//     focus: { analytical: 0.25, creative: 0.1, applied: 0.4, social: 0.05, aiReadiness: 0.2 },
//     ugDegrees: ["BTech Mechanical Engineering", "BEng Mechatronics"],
//     pgDegrees: ["MEng Robotics", "MS Industrial Engineering"],
//     advancedPgDegrees: ["Executive MEng Systems Engineering", "Specialist Masters in Robotics Integration"],
//     jobRoles: ["Mechanical Design Engineer", "Manufacturing Engineer", "Robotics Technician"],
//     rejectedReason: "Hands-on technical systems work looks under-supported by the current answers and exposure signals.",
//   },
//   {
//     career: "Psychology & Counselling",
//     focus: { analytical: 0.1, creative: 0.1, applied: 0.1, social: 0.5, aiReadiness: 0.2 },
//     ugDegrees: ["BA Psychology", "BSc Psychology"],
//     pgDegrees: ["MA Counselling Psychology", "MSc Clinical Psychology"],
//     advancedPgDegrees: ["MPH Mental Health", "Executive Masters in Counselling Practice"],
//     jobRoles: ["Student Counsellor", "Behaviour Analyst", "Wellbeing Coach"],
//     rejectedReason: "The current profile does not show enough people-centred emotional support alignment for this to be a strong match.",
//   },
//   {
//     career: "Business & Entrepreneurship",
//     focus: { analytical: 0.2, creative: 0.15, applied: 0.2, social: 0.2, aiReadiness: 0.25 },
//     ugDegrees: ["BBA", "BCom", "Bachelor of Entrepreneurship"],
//     pgDegrees: ["MBA", "MSc Management"],
//     advancedPgDegrees: ["Executive MBA", "MBA Strategy", "Specialist Masters in Venture Building"],
//     jobRoles: ["Business Analyst", "Operations Associate", "Startup Founder"],
//     rejectedReason: "This route is weaker when risk appetite, initiative, or leadership drive do not show up strongly enough.",
//   },
//   {
//     career: "Media & Communications",
//     focus: { analytical: 0.05, creative: 0.3, applied: 0.1, social: 0.35, aiReadiness: 0.2 },
//     ugDegrees: ["BA Journalism", "BA Media Studies", "BA Communication"],
//     pgDegrees: ["MA Communication", "MSc Digital Media"],
//     advancedPgDegrees: ["Executive Masters in Brand Strategy", "Specialist MA Digital Storytelling"],
//     jobRoles: ["Content Strategist", "PR Executive", "Community Manager"],
//     rejectedReason: "The answers do not yet show strong enough communication, storytelling, or creative momentum for this path.",
//   },
// ];

// function clamp(value, min = 0, max = 100) {
//   return Math.max(min, Math.min(max, value));
// }

// function riskLabel(score) {
//   if (score >= 75) return "Strong";
//   if (score >= 50) return "Moderate";
//   return "Weak";
// }

// function level(score) {
//   if (score >= 67) return "High";
//   if (score >= 40) return "Medium";
//   return "Low";
// }

// function getBehaviourProfile(answerByQuestionKey) {
//   const ambiguitySignals = [
//     answerByQuestionKey.get("B::Do you prefer?"),
//     answerByQuestionKey.get("B::How do you react when something is unclear?"),
//   ].filter(Boolean);
//   let ambiguityScore = 50;
//   if (ambiguitySignals.includes("open_ended_problems")) ambiguityScore += 25;
//   if (ambiguitySignals.includes("try_to_figure_it_out")) ambiguityScore += 20;
//   if (ambiguitySignals.includes("wait_for_guidance")) ambiguityScore -= 20;
//   if (ambiguitySignals.includes("avoid_it")) ambiguityScore -= 25;

//   const disciplineSignals = [
//     answerByQuestionKey.get("B::Which describes you better?"),
//     answerByQuestionKey.get("B::Do you complete tasks even when they become boring?"),
//     answerByQuestionKey.get("B::When a deadline is near you?"),
//   ].filter(Boolean);
//   let disciplineScore = 50;
//   if (disciplineSignals.includes("consistent_and_disciplined")) disciplineScore += 20;
//   if (disciplineSignals.includes("yes_always")) disciplineScore += 20;
//   if (disciplineSignals.includes("work_consistently_throughout")) disciplineScore += 20;
//   if (disciplineSignals.includes("burst_of_energy_then_drop")) disciplineScore -= 20;
//   if (disciplineSignals.includes("rarely")) disciplineScore -= 20;
//   if (disciplineSignals.includes("rush_at_the_last_minute")) disciplineScore -= 20;

//   const riskSignals = [
//     answerByQuestionKey.get("D::Would you choose?"),
//     answerByQuestionKey.get("D::Are you open to moving abroad for education or work?"),
//     answerByQuestionKey.get("D::Are you open to taking an education loan?"),
//   ].filter(Boolean);
//   let riskScore = 50;
//   if (riskSignals.includes("high_risk_path")) riskScore += 20;
//   if (riskSignals.includes("yes_eagerly")) riskScore += 15;
//   if (riskSignals.includes("yes_if_needed")) riskScore += 8;
//   if (riskSignals.includes("yes")) riskScore += 10;
//   if (riskSignals.includes("stable_job")) riskScore -= 15;
//   if (riskSignals.includes("prefer_to_stay")) riskScore -= 10;
//   if (riskSignals.includes("not_at_all")) riskScore -= 15;
//   if (riskSignals.includes("no")) riskScore -= 10;

//   return {
//     ambiguity: level(clamp(ambiguityScore)),
//     discipline: level(clamp(disciplineScore)),
//     riskAppetite: level(clamp(riskScore)),
//   };
// }

// function getContradictionFlags({ behaviourProfile, traitScores, answerByQuestionKey }) {
//   const flags = [];
//   if (behaviourProfile.riskAppetite === "Low" && answerByQuestionKey.get("D::Would you choose?") === "high_risk_path") {
//     flags.push("Says they want a high-upside path but shows hesitation in other risk decisions.");
//   }
//   if (traitScores.aiReadinessIndex < 40 && answerByQuestionKey.get("E::How do you feel about working alongside AI tools in your future job?") === "excited") {
//     flags.push("Positive toward AI, but current tool usage suggests readiness still needs work.");
//   }
//   if (behaviourProfile.discipline === "Low" && answerByQuestionKey.get("F::What motivates you to push through difficult tasks?") === "personal_pride") {
//     flags.push("Strong self-image around persistence, but work-style answers show inconsistent follow-through.");
//   }
//   if (traitScores.social >= 75 && answerByQuestionKey.get("B::Do you enjoy working?") === "alone") {
//     flags.push("High people-skill signal paired with a strong preference for solo work.");
//   }
//   return flags;
// }

// function getCareerMatches(traitScores, behaviourProfile) {
//   const scored = CAREER_CATALOG.map((career) => {
//     const matchPercent = Math.round(
//       (traitScores.analytical * career.focus.analytical) +
//       (traitScores.creative * career.focus.creative) +
//       (traitScores.applied * career.focus.applied) +
//       (traitScores.social * career.focus.social) +
//       (traitScores.aiReadinessIndex * career.focus.aiReadiness),
//     );
//     const behaviourBoost =
//       (behaviourProfile.ambiguity === "High" ? 3 : 0) +
//       (behaviourProfile.discipline === "High" ? 3 : 0) +
//       (behaviourProfile.riskAppetite === "High" ? 2 : 0);
//     return { ...career, matchPercent: clamp(matchPercent + behaviourBoost) };
//   }).sort((a, b) => b.matchPercent - a.matchPercent);

//   const rejectedPool = scored.slice(2).sort((a, b) => a.matchPercent - b.matchPercent);
//   const rejected = rejectedPool.slice(0, Math.min(4, Math.max(3, rejectedPool.length))).map((item) => ({
//     career: item.career,
//     matchPercent: item.matchPercent,
//     reason: item.rejectedReason,
//   }));

//   return {
//     primary: scored[0],
//     secondary: scored[1],
//     rejected,
//   };
// }

// async function checkAiRisk(jobTitle) {
//   if (!GEMINI_MODEL) {
//     return {
//       aiRisk: "at-risk",
//       riskLabel: "Watch closely",
//       whatAiIsDoing: "AI tools are automating parts of the routine workflow in this role, especially drafting, analysis support, and repetitive output generation.",
//       whatStudentShouldDo: "Build judgement-heavy, client-facing, and AI-assisted workflow skills to stay competitive.",
//     };
//   }

//   try {
//     const model = GEMINI_MODEL.getGenerativeModel({ model: "gemini-2.5-flash" });
//     const prompt = `Reply with JSON only for the job "${jobTitle}":
// {"aiRisk":"safe|at-risk|high-risk","riskLabel":"AI-resilient|Watch closely|High AI risk","whatAiIsDoing":"one sentence","whatStudentShouldDo":"one sentence"}
// Use exactly these mappings:
// safe -> AI-resilient
// at-risk -> Watch closely
// high-risk -> High AI risk`;
//     const result = await model.generateContent(prompt);
//     const parsed = JSON.parse(result.response.text().trim().replace(/^```json|```$/g, "").trim());
//     const aiRisk = ["safe", "at-risk", "high-risk"].includes(parsed.aiRisk) ? parsed.aiRisk : "at-risk";
//     const riskLabel = aiRisk === "safe" ? "AI-resilient" : aiRisk === "high-risk" ? "High AI risk" : "Watch closely";
//     return {
//       aiRisk,
//       riskLabel,
//       whatAiIsDoing: parsed.whatAiIsDoing || "AI is automating routine parts of this role and speeding up baseline output generation.",
//       whatStudentShouldDo: parsed.whatStudentShouldDo || "Focus on deeper judgement, domain expertise, and AI-assisted workflow skills.",
//     };
//   } catch (_error) {
//     return {
//       aiRisk: "at-risk",
//       riskLabel: "Watch closely",
//       whatAiIsDoing: "AI is automating routine parts of this role and speeding up baseline output generation.",
//       whatStudentShouldDo: "Focus on deeper judgement, domain expertise, and AI-assisted workflow skills.",
//     };
//   }
// }

// async function buildSummary(student, snapshot) {
//   if (!GEMINI_MODEL) {
//     return `${student.name} shows strongest fit for ${snapshot.careerFit.primary.career}, with ${snapshot.behaviourProfile.discipline.toLowerCase()} discipline and ${snapshot.behaviourProfile.ambiguity.toLowerCase()} comfort with ambiguity. Focus next on practical exploration, digital fluency, and decision clarity before choosing a degree path.`;
//   }

//   try {
//     const model = GEMINI_MODEL.getGenerativeModel({ model: "gemini-2.5-flash" });
//     const prompt = `
// You are a study-abroad career advisor. Write one concise paragraph for a student.
// Student name: ${student.name}
// Trait scores: ${JSON.stringify(snapshot.traitScores)}
// Behaviour profile: ${JSON.stringify(snapshot.behaviourProfile)}
// AI readiness: ${snapshot.aiReadinessIndex}
// Primary career fit: ${snapshot.careerFit.primary.career} (${snapshot.careerFit.primary.matchPercent}%)
// Secondary career fit: ${snapshot.careerFit.secondary.career} (${snapshot.careerFit.secondary.matchPercent}%)
// Contradictions: ${snapshot.contradictionFlags.join("; ") || "None"}
// Keep it practical, supportive, and candid in under 90 words.
// `;
//     const result = await model.generateContent(prompt);
//     return result.response.text().trim();
//   } catch (_error) {
//     return `${student.name} shows strongest fit for ${snapshot.careerFit.primary.career}, with ${snapshot.behaviourProfile.discipline.toLowerCase()} discipline and ${snapshot.behaviourProfile.ambiguity.toLowerCase()} comfort with ambiguity. Focus next on practical exploration, digital fluency, and decision clarity before choosing a degree path.`;
//   }
// }

// function buildQuestionMap(questions) {
//   return new Map(questions.map((question) => [String(question._id), question]));
// }

// function getEducationLevel(responseDoc, questions) {
//   const targetQuestion = questions.find((question) => question.questionText === EDUCATION_LEVEL_QUESTION);
//   if (!targetQuestion) return "pre_ug";

//   const answer = responseDoc.answers.find((item) => String(item.questionId) === String(targetQuestion._id));
//   return answer?.selectedValue || "pre_ug";
// }

// function projectDegrees(entry, educationLevel) {
//   if (educationLevel === "ug_complete") {
//     return {
//       ugDegrees: [],
//       pgDegrees: entry.pgDegrees,
//     };
//   }

//   if (educationLevel === "pg_complete") {
//     return {
//       ugDegrees: [],
//       pgDegrees: entry.advancedPgDegrees || entry.pgDegrees,
//     };
//   }

//   return {
//     ugDegrees: entry.ugDegrees,
//     pgDegrees: [],
//   };
// }

// function computeSnapshot(student, questions, responseDoc) {
//   const questionMap = buildQuestionMap(questions);
//   const totals = { analytical: 0, creative: 0, applied: 0, social: 0, aiReadiness: 0 };
//   const maxTotals = { analytical: 0, creative: 0, applied: 0, social: 0, aiReadiness: 0 };
//   const sectionRollup = new Map();
//   const answerByQuestionKey = new Map();

//   for (const answer of responseDoc.answers) {
//     const question = questionMap.get(String(answer.questionId));
//     if (!question) continue;
//     const choice = question.choices.find((item) => item.value === answer.selectedValue)
//       || question.choices.find((item) => item.allowCustomInput && answer.customAnswer);
//     if (!choice) continue;

//     answerByQuestionKey.set(`${question.section}::${question.questionText}`, answer.selectedValue);

//     const sectionState = sectionRollup.get(question.section) || { total: 0, max: 0 };
//     const maxChoiceScore = Math.max(...question.choices.map((item) => TRAITS.reduce((sum, trait) => sum + item.weights[trait], 0)));
//     const selectedScore = TRAITS.reduce((sum, trait) => sum + choice.weights[trait], 0);
//     sectionState.total += selectedScore;
//     sectionState.max += maxChoiceScore;
//     sectionRollup.set(question.section, sectionState);

//     for (const trait of TRAITS) {
//       totals[trait] += choice.weights[trait];
//       maxTotals[trait] += Math.max(...question.choices.map((item) => item.weights[trait]));
//     }
//   }

//   const traitScores = {
//     analytical: clamp(Math.round((totals.analytical / Math.max(maxTotals.analytical, 1)) * 100)),
//     creative: clamp(Math.round((totals.creative / Math.max(maxTotals.creative, 1)) * 100)),
//     applied: clamp(Math.round((totals.applied / Math.max(maxTotals.applied, 1)) * 100)),
//     social: clamp(Math.round((totals.social / Math.max(maxTotals.social, 1)) * 100)),
//     aiReadinessIndex: clamp(Math.round((totals.aiReadiness / Math.max(maxTotals.aiReadiness, 1)) * 100)),
//   };

//   const behaviourProfile = getBehaviourProfile(answerByQuestionKey);
//   const sectionScores = Object.keys(sectionTitles).map((section) => {
//     const state = sectionRollup.get(section) || { total: 0, max: 1 };
//     const score = clamp(Math.round((state.total / Math.max(state.max, 1)) * 100));
//     return { section, score, fit: riskLabel(score) };
//   });

//   const contradictionFlags = getContradictionFlags({ behaviourProfile, traitScores, answerByQuestionKey });
//   const careerFit = getCareerMatches(traitScores, behaviourProfile);
//   const educationLevel = getEducationLevel(responseDoc, questions);
//   const primaryDegrees = projectDegrees(careerFit.primary, educationLevel);
//   const secondaryDegrees = projectDegrees(careerFit.secondary, educationLevel);

//   return {
//     userId: student._id,
//     generatedAt: new Date(),
//     educationLevel,
//     traitScores: {
//       analytical: traitScores.analytical,
//       creative: traitScores.creative,
//       applied: traitScores.applied,
//       social: traitScores.social,
//     },
//     behaviourProfile,
//     aiReadinessIndex: traitScores.aiReadinessIndex,
//     sectionScores,
//     contradictionFlags,
//     careerFit: {
//       primary: { ...careerFit.primary, ...primaryDegrees },
//       secondary: { ...careerFit.secondary, ...secondaryDegrees },
//       rejected: careerFit.rejected,
//     },
//   };
// }

// async function enrichCareerFit(careerFit) {
//   const enrichEntry = async (entry) => {
//     const jobRoles = await Promise.all(entry.jobRoles.map(async (title) => {
//       const risk = await checkAiRisk(title);
//       return { title, ...risk };
//     }));
//     return {
//       career: entry.career,
//       matchPercent: entry.matchPercent,
//       ugDegrees: entry.ugDegrees,
//       pgDegrees: entry.pgDegrees,
//       jobRoles,
//     };
//   };

//   return {
//     primary: await enrichEntry(careerFit.primary),
//     secondary: await enrichEntry(careerFit.secondary),
//     rejected: careerFit.rejected,
//   };
// }

// async function generateResultForUser(userId) {
//   const [student, latestResponse, questions] = await Promise.all([
//     StudentAccount.findById(userId),
//     Response.findOne({ userId }).sort({ submittedAt: -1 }).lean(),
//     Question.find().sort({ order: 1 }).lean(),
//   ]);

//   if (!student) {
//     const error = new Error("Student not found");
//     error.status = 404;
//     throw error;
//   }

//   if (!latestResponse) {
//     const error = new Error("No responses submitted yet");
//     error.status = 400;
//     throw error;
//   }

//   const snapshot = computeSnapshot(student, questions, latestResponse);
//   snapshot.careerFit = await enrichCareerFit(snapshot.careerFit);
//   snapshot.aiSuggestionSummary = await buildSummary(student, snapshot);

//   const saved = await Result.findOneAndUpdate(
//     { userId: student._id },
//     snapshot,
//     { new: true, upsert: true, setDefaultsOnInsert: true },
//   ).lean();

//   return { ...saved, userName: student.name };
// }

// module.exports = {
//   generateResultForUser,
// };
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Question = require("../models/Question");
const Response = require("../models/Response");
const Result = require("../models/Result");
const StudentAccount = require("../models/StudentAccount");

const EDUCATION_LEVEL_QUESTION = "What is your highest completed qualification?";

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

// ─── Step 1: Build readable answer list ────────────────────────────────────

function buildReadableAnswers(questions, responseDoc) {
  const questionMap = new Map(questions.map((q) => [String(q._id), q]));
  const lines = [];

  for (const answer of responseDoc.answers) {
    const question = questionMap.get(String(answer.questionId));
    if (!question) continue;
    lines.push(
      `Section ${question.section} – ${question.questionText}\n` +
      `Student answered: "${answer.selectedLabel || answer.selectedValue}"` +
      (answer.customAnswer ? ` (custom: "${answer.customAnswer}")` : "")
    );
  }

  return lines.join("\n\n");
}

function getEducationLevel(questions, responseDoc) {
  const targetQuestion = questions.find(
    (q) => q.questionText === EDUCATION_LEVEL_QUESTION
  );
  if (!targetQuestion) return "pre_ug";

  const answer = responseDoc.answers.find(
    (a) => String(a.questionId) === String(targetQuestion._id)
  );
  return answer?.selectedValue || "pre_ug";
}

// ─── Step 2: Gemini 2.5 Pro — full scoring ─────────────────────────────────

async function scoreWithGeminiPro(student, readableAnswers, educationLevel) {
  if (!genAI) {
    throw new Error(
      "GEMINI_API_KEY is not set. Cannot generate results without Gemini."
    );
  }

  const degreeInstruction =
    educationLevel === "ug_complete"
      ? "Student has completed a Bachelor's degree. Return PG degrees only (MSc, MTech, MA, MBA, MDes). Set ugDegrees to empty array. Maximum Masters level — no PhD."
      : educationLevel === "pg_complete"
      ? "Student has completed a Master's degree. Return advanced specialisation Masters only (Executive MBA, MPH, LLM, second Masters). Set ugDegrees to empty array."
      : "Student has not yet completed a Bachelor's degree. Return UG degrees only (BSc, BTech, BA, BCA, BDes, BBA). Set pgDegrees to empty array.";

  const systemPrompt = `You are an expert career guidance AI for higher education students planning to study abroad.

A student named ${student.name} has completed a 51-question diagnostic across 7 sections (A to G).

IMPORTANT SCORING RULES:
- Section G answers are constraints only — do NOT use them for trait scoring.
- Use sections A through F only for calculating trait scores and section scores.
- Apply these weights: Behavioural evidence (B and F) = 40%, Performance signals (A and C) = 30%, Consistency across all answers = 20%, Self-perception (D and E) = 10%.

DEGREE INSTRUCTION:
${degreeInstruction}

Return ONLY a valid raw JSON object with no markdown, no code blocks, no explanation. Use this exact structure:

{
  "traitScores": {
    "analytical": <number 0-100>,
    "creative": <number 0-100>,
    "applied": <number 0-100>,
    "social": <number 0-100>
  },
  "behaviourProfile": {
    "ambiguity": "High" or "Medium" or "Low",
    "discipline": "High" or "Medium" or "Low",
    "riskAppetite": "High" or "Medium" or "Low"
  },
  "aiReadinessIndex": <number 0-100>,
  "sectionScores": [
    { "section": "A", "score": <number 0-100>, "fit": "Strong" or "Moderate" or "Weak" },
    { "section": "B", "score": <number 0-100>, "fit": "Strong" or "Moderate" or "Weak" },
    { "section": "C", "score": <number 0-100>, "fit": "Strong" or "Moderate" or "Weak" },
    { "section": "D", "score": <number 0-100>, "fit": "Strong" or "Moderate" or "Weak" },
    { "section": "E", "score": <number 0-100>, "fit": "Strong" or "Moderate" or "Weak" },
    { "section": "F", "score": <number 0-100>, "fit": "Strong" or "Moderate" or "Weak" },
    { "section": "G", "score": <number 0-100>, "fit": "Strong" or "Moderate" or "Weak" }
  ],
  "contradictionFlags": [
    "<one sentence describing a real contradiction found across answers>"
  ],
  "careerFit": {
    "primary": {
      "career": "<career name>",
      "matchPercent": <number 80-100>,
      "ugDegrees": ["<degree>", "<degree>", "<degree>"],
      "pgDegrees": ["<degree>", "<degree>"],
      "jobRoles": ["<role title>", "<role title>", "<role title>"]
    },
    "secondary": {
      "career": "<career name>",
      "matchPercent": <number 60-80>,
      "ugDegrees": ["<degree>", "<degree>"],
      "pgDegrees": ["<degree>", "<degree>"],
      "jobRoles": ["<role title>", "<role title>", "<role title>"]
    },
    "rejected": [
      { "career": "<career name>", "matchPercent": <number below 50>, "reason": "<one sentence why this does not fit the student>" },
      { "career": "<career name>", "matchPercent": <number below 50>, "reason": "<one sentence why this does not fit the student>" },
      { "career": "<career name>", "matchPercent": <number below 50>, "reason": "<one sentence why this does not fit the student>" },
      { "career": "<career name>", "matchPercent": <number below 50>, "reason": "<one sentence why this does not fit the student>" }
    ]
  },
  "aiSuggestionSummary": "<one paragraph under 90 words written directly to ${student.name}, practical, supportive, and candid>"
}`;

  const userMessage = `Here are all of ${student.name}'s answers:\n\n${readableAnswers}`;

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: userMessage }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
  });

  const raw = result.response.text().trim().replace(/^```json|^```|```$/g, "").trim();

  console.log("\n========== GEMINI 2.5 PRO RESPONSE ==========");
  console.log(raw);
  console.log("==============================================\n");

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error("Failed to parse Gemini 2.5 Pro response:", err.message);
    throw new Error("Gemini 2.5 Pro returned invalid JSON. Check the logs above.");
  }

  // Clamp all numeric values to be safe
  parsed.traitScores.analytical = clamp(parsed.traitScores.analytical);
  parsed.traitScores.creative = clamp(parsed.traitScores.creative);
  parsed.traitScores.applied = clamp(parsed.traitScores.applied);
  parsed.traitScores.social = clamp(parsed.traitScores.social);
  parsed.aiReadinessIndex = clamp(parsed.aiReadinessIndex);
  parsed.careerFit.primary.matchPercent = clamp(parsed.careerFit.primary.matchPercent);
  parsed.careerFit.secondary.matchPercent = clamp(parsed.careerFit.secondary.matchPercent);

  return parsed;
}

// ─── Step 3: Gemini 2.5 Flash + Search Grounding — AI risk per job role ────

async function checkAiRisk(jobTitle) {
  if (!genAI) {
    return {
      title: jobTitle,
      aiRisk: "at-risk",
      riskLabel: "Watch closely",
      whatAiIsDoing: "AI tools are automating routine parts of this role including drafting, analysis, and repetitive output generation.",
      whatStudentShouldDo: "Build judgement-heavy, client-facing, and AI-assisted workflow skills to stay competitive.",
    };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      tools: [{ googleSearch: {} }],
    });

    const prompt = `Search the web for current information about the job role "${jobTitle}" and its AI automation risk in 2025-2026.

Reply with JSON only, no markdown, no code blocks:
{
  "aiRisk": "safe" or "at-risk" or "high-risk",
  "riskLabel": "AI-resilient" or "Watch closely" or "High AI risk",
  "whatAiIsDoing": "one sentence describing what AI tools are currently doing to this specific role in 2025",
  "whatStudentShouldDo": "one sentence of specific actionable upskilling advice for someone entering this role"
}

Use exactly these mappings: safe → AI-resilient, at-risk → Watch closely, high-risk → High AI risk`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim().replace(/^```json|^```|```$/g, "").trim();
    const parsed = JSON.parse(raw);

    const validRisks = ["safe", "at-risk", "high-risk"];
    const aiRisk = validRisks.includes(parsed.aiRisk) ? parsed.aiRisk : "at-risk";
    const riskLabel =
      aiRisk === "safe"
        ? "AI-resilient"
        : aiRisk === "high-risk"
        ? "High AI risk"
        : "Watch closely";

    return {
      title: jobTitle,
      aiRisk,
      riskLabel,
      whatAiIsDoing:
        parsed.whatAiIsDoing ||
        "AI is automating routine parts of this role and accelerating baseline output generation.",
      whatStudentShouldDo:
        parsed.whatStudentShouldDo ||
        "Focus on deeper domain expertise, judgement, and AI-assisted workflow skills.",
    };
  } catch (err) {
    console.error(`AI risk check failed for "${jobTitle}":`, err.message);
    return {
      title: jobTitle,
      aiRisk: "at-risk",
      riskLabel: "Watch closely",
      whatAiIsDoing: "AI is automating routine parts of this role and accelerating baseline output generation.",
      whatStudentShouldDo: "Focus on deeper domain expertise, judgement, and AI-assisted workflow skills.",
    };
  }
}

// ─── Step 4: Enrich job roles with AI risk ─────────────────────────────────

async function enrichJobRoles(careerFit) {
  const primaryRoles = await Promise.all(
    careerFit.primary.jobRoles.map((title) => checkAiRisk(title))
  );
  const secondaryRoles = await Promise.all(
    careerFit.secondary.jobRoles.map((title) => checkAiRisk(title))
  );

  return {
    primary: { ...careerFit.primary, jobRoles: primaryRoles },
    secondary: { ...careerFit.secondary, jobRoles: secondaryRoles },
    rejected: careerFit.rejected,
  };
}

// ─── Main export ────────────────────────────────────────────────────────────

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

  // Step 1 — build readable answers + extract education level
  const readableAnswers = buildReadableAnswers(questions, latestResponse);
  const educationLevel = getEducationLevel(questions, latestResponse);

  console.log(`\nGenerating result for: ${student.name}`);
  console.log(`Education level detected: ${educationLevel}`);
  console.log(`Total answers collected: ${latestResponse.answers.length}`);

  // Step 2 — Gemini 2.5 Pro scores everything
  const scored = await scoreWithGeminiPro(student, readableAnswers, educationLevel);

  // Step 3 — Gemini 2.5 Flash + Search Grounding for each job role
  console.log("\nChecking AI risk for job roles via Gemini 2.5 Flash + Search Grounding...");
  const enrichedCareerFit = await enrichJobRoles(scored.careerFit);

  // Step 4 — Build final result document
  const resultDoc = {
    userId: student._id,
    generatedAt: new Date(),
    educationLevel,
    traitScores: scored.traitScores,
    behaviourProfile: scored.behaviourProfile,
    aiReadinessIndex: scored.aiReadinessIndex,
    sectionScores: scored.sectionScores,
    contradictionFlags: scored.contradictionFlags || [],
    careerFit: enrichedCareerFit,
    aiSuggestionSummary: scored.aiSuggestionSummary,
  };

  // Step 5 — Save to results collection
  const saved = await Result.findOneAndUpdate(
    { userId: student._id },
    resultDoc,
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  // Step 6 — Update student status to answered
  await StudentAccount.findByIdAndUpdate(student._id, { status: "answered" });

  console.log(`\nResult saved successfully for ${student.name}`);

  return { ...saved, userName: student.name };
}

// ─── Queue (rate-limit guard for Gemini Pro 2 RPM) ──────────────────────────

let isProcessing = false;
const queue = []; // { userId, resolve, reject }

function queuePositionFor(userId) {
  // 0 = not in queue (or currently processing if isProcessing && first added).
  const idx = queue.findIndex((item) => String(item.userId) === String(userId));
  if (idx === -1) return 0;
  // +1 because position 1 = next to run; the currently processing job is not in the queue array
  return idx + 1 + (isProcessing ? 1 : 0);
}

function isQueueProcessing() {
  return isProcessing;
}

async function processQueue() {
  if (isProcessing || queue.length === 0) return;
  isProcessing = true;
  const { userId, resolve, reject } = queue.shift();
  try {
    const result = await generateResultForUser(userId);
    resolve(result);
  } catch (err) {
    reject(err);
  } finally {
    // 35s gap to respect 2 RPM Gemini Pro free-tier limit
    await new Promise((r) => setTimeout(r, 35000));
    isProcessing = false;
    processQueue();
  }
}

function queuedGenerate(userId) {
  return new Promise((resolve, reject) => {
    queue.push({ userId, resolve, reject });
    processQueue();
  });
}

module.exports = {
  generateResultForUser,
  queuedGenerate,
  queuePositionFor,
  isQueueProcessing,
};