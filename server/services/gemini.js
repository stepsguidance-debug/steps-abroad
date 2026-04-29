// Gemini integration for Steps Guidance.
// - analyzeProfile uses Gemini 2.5 Pro with structured JSON output.
// - checkAiRisk uses Gemini 2.5 Flash with Google Search grounding for up-to-date info.
//
// Scoring rubric:
//   weights = 40% behavioural / 30% performance / 20% consistency / 10% self-perception
//   traits  = Analytical / Creative / Applied / Social as 0-100
//   section scores 0-100  (Strong >=75 / Moderate 50-74 / Weak <50)
//   Career fit: Primary >=80, Secondary 60-80, Rejected <40

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const RUBRIC = `
You are a career-guidance AI for high-school students applying abroad.
Apply this rubric strictly:
- Weights: behavioural 0.40, performance 0.30, consistency 0.20, self-perception 0.10.
- Traits Analytical / Creative / Applied / Social as integers 0-100.
- Seven section scores 0-100 with fit label: Strong >=75, Moderate 50-74, Weak <50.
- Career fit:
   * Primary careers: derived from strongest traits & sections (>=80 alignment).
   * Secondary: 60-80 alignment.
   * Each career: undergraduate degree, postgraduate degree (cap at Masters), 3 sample roles.
- Detect contradiction flags between self-perception and behavioural answers.
- Output an aiReadinessIndex 0-100 capturing future-of-work resilience.
- aiSummary: 2-3 sentences, supportive but candid.
Return JSON ONLY matching the requested schema.
`;

async function analyzeProfile({ user, questions, answers }) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-pro",
    generationConfig: { responseMimeType: "application/json" },
  });

  const qById = new Map(questions.map((q) => [String(q._id), q]));
  const transcript = answers.map((a) => {
    const q = qById.get(String(a.questionId));
    return q ? `[${q.section}] ${q.text} -> ${a.value}` : null;
  }).filter(Boolean).join("\n");

  const prompt = `
${RUBRIC}

Student: ${user.name} (${user.email})

Answers:
${transcript}

Schema:
{
  "aiReadinessIndex": number,
  "traitScores": {"Analytical":number,"Creative":number,"Applied":number,"Social":number},
  "behaviourProfile": string,
  "sectionScores": [{"section":"A","title":string,"score":number,"fit":"Strong|Moderate|Weak"}],
  "contradictionFlags": [{"area":string,"note":string}],
  "careerFit": {
     "primary":   [{"title":string,"ug":string,"pg":string,"roles":[string,string,string]}],
     "secondary": [{"title":string,"ug":string,"pg":string,"roles":[string,string,string]}]
  },
  "aiSummary": string
}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return JSON.parse(text);
}

async function checkAiRisk(jobTitle) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    tools: [{ googleSearch: {} }],
  });
  const prompt = `
For the job title "${jobTitle}", classify automation risk over the next 10 years.
Use recent (post-2024) sources where possible.
Reply with JSON only: { "aiRisk": "low|medium|high", "advice": "<one short sentence of guidance>" }.
`;
  try {
    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim().replace(/^```json|```$/g, "").trim();
    const parsed = JSON.parse(raw);
    return { aiRisk: parsed.aiRisk || "medium", advice: parsed.advice || "" };
  } catch (e) {
    console.warn("checkAiRisk fallback for", jobTitle, e.message);
    return { aiRisk: "medium", advice: "Stay current with AI tools and focus on judgement-heavy work." };
  }
}

module.exports = { analyzeProfile, checkAiRisk };
