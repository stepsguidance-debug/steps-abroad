const Question = require("../models/Question");
const { sectionTitles } = require("../data/questionBank");

const QUESTION_TYPES = new Set(["mcq", "forced-choice", "scale"]);

/** Canonical flow A→G — same keys as sectionTitles */
const SECTION_ORDER = Object.keys(sectionTitles).sort();

function sectionRank(section) {
  const i = SECTION_ORDER.indexOf(section);
  return i >= 0 ? i : SECTION_ORDER.length;
}

/**
 * 0-based index where a new question in `targetSection` should sit in globally ordered quiz flow:
 * immediately after the last existing question of that section, or before the next higher letter section.
 */
function computeInsertIndexWithinSection(targetSection, sortedQuestions) {
  let lastSame = -1;
  for (let i = 0; i < sortedQuestions.length; i++) {
    if (sortedQuestions[i].section === targetSection) lastSame = i;
  }
  if (lastSame >= 0) return lastSame + 1;

  const targetR = sectionRank(targetSection);
  for (let i = 0; i < sortedQuestions.length; i++) {
    if (sectionRank(sortedQuestions[i].section) > targetR) return i;
  }
  return sortedQuestions.length;
}

function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || `choice_${Date.now()}`;
}

/** Accept common variants (underscores / spacing) from CSV or manual DB edits. */
function coerceQuestionType(raw) {
  const compact = String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "")
    .replace(/_/g, "");
  if (compact === "mcq" || compact === "multiplechoice") return "mcq";
  if (compact === "forcedchoice") return "forced-choice";
  if (compact === "scale") return "scale";
  return null;
}

function rawChoicesToArray(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw != null && typeof raw === "object") {
    return Object.keys(raw)
      .filter((k) => /^\d+$/.test(k))
      .sort((a, b) => Number(a) - Number(b))
      .map((k) => raw[k]);
  }
  return [];
}

function normalizeWeights(weights = {}) {
  return {
    analytical: Number(weights.analytical ?? 5),
    creative: Number(weights.creative ?? 5),
    applied: Number(weights.applied ?? 5),
    social: Number(weights.social ?? 5),
    aiReadiness: Number(weights.aiReadiness ?? 5),
  };
}

function normalizeChoice(choice, index) {
  const label = String(choice.label || "").trim();
  if (!label) {
    const error = new Error(`Choice ${index + 1} is missing a label`);
    error.status = 400;
    throw error;
  }

  const explicit = String(choice.value || "").trim();
  const slug = slugify(label);
  /** Index suffix avoids duplicate internal values across options with similar labels */
  const value = explicit || (slug ? `${slug}_${index + 1}` : `choice_${index + 1}`);

  return {
    label,
    value,
    allowCustomInput: Boolean(choice.allowCustomInput),
    customInputPlaceholder: String(choice.customInputPlaceholder || "").trim(),
    weights: normalizeWeights(choice.weights),
  };
}

function normalizeQuestionInput(input) {
  const section = String(input.section || "").trim();
  const questionText = String(input.questionText || "").trim();
  const layer = String(input.layer || "").trim();
  const typeRaw = String(input.type || "").trim();
  const type = coerceQuestionType(typeRaw);

  if (!sectionTitles[section]) {
    const error = new Error("Invalid section");
    error.status = 400;
    throw error;
  }
  if (!questionText) {
    const error = new Error("Question text is required");
    error.status = 400;
    throw error;
  }
  if (!type || !QUESTION_TYPES.has(type)) {
    const error = new Error(`Invalid question type "${typeRaw}". Use mcq, forced-choice, or scale.`);
    error.status = 400;
    throw error;
  }

  const choices = Array.isArray(input.choices) ? input.choices.map(normalizeChoice) : [];
  if (choices.length < 2) {
    const error = new Error("At least 2 options are required");
    error.status = 400;
    throw error;
  }

  return {
    section,
    sectionTitle: sectionTitles[section],
    questionText,
    type,
    layer,
    choices,
  };
}

async function resequenceQuestions() {
  const questions = await Question.find().sort({ order: 1, createdAt: 1 });
  await Promise.all(
    questions.map((question, index) => Question.updateOne({ _id: question._id }, { order: index + 1 })),
  );
}

async function createQuestion(input) {
  const normalized = normalizeQuestionInput(input);
  const sorted = await Question.find().sort({ order: 1, createdAt: 1 }).lean();
  const insertAt = computeInsertIndexWithinSection(normalized.section, sorted);
  const newOrderOneBased = insertAt + 1;

  await Question.updateMany({ order: { $gte: newOrderOneBased } }, { $inc: { order: 1 } });
  const created = await Question.create({ ...normalized, order: newOrderOneBased });
  return sanitizeLeanQuestion(created.toObject());
}

async function deleteQuestion(questionId) {
  await Question.findByIdAndDelete(questionId);
  await resequenceQuestions();
}

/**
 * Normalize a Mongo lean document for GET /questions so student + admin clients
 * always see an array of choices (fixes edge cases where choices were stored oddly).
 */
function sanitizeLeanQuestion(doc) {
  if (!doc || typeof doc !== "object") return null;
  const rows = rawChoicesToArray(doc.choices);
  const used = new Set();
  const choices = rows.map((choice, index) => {
    const label = String(choice?.label ?? "").trim();
    const explicit = String(choice?.value ?? "").trim();
    const slug = slugify(label);
    let value = explicit || (slug ? `${slug}_${index + 1}` : `choice_${index + 1}`);
    let conflict = 0;
    while (used.has(value)) {
      conflict += 1;
      value = `${explicit || slug || "opt"}_${index + 1}_v${conflict}`;
    }
    used.add(value);
    const keep = label !== "" || explicit !== ""; // preserve row if explicit value-only (avoid blank UI dots)
    if (!keep) return null;
    const finalLabel = label || explicit || value;
    return {
      label: finalLabel,
      value,
      allowCustomInput: Boolean(choice.allowCustomInput),
      customInputPlaceholder: String(choice.customInputPlaceholder || "").trim(),
      weights: normalizeWeights(choice.weights),
    };
  }).filter(Boolean);

  const typeCoerced = coerceQuestionType(doc.type);
  const type = QUESTION_TYPES.has(typeCoerced) ? typeCoerced : "mcq";

  const out = { ...doc, type, choices };
  return out;
}

async function deleteQuestionOption(questionId, optionValue) {
  const question = await Question.findById(questionId);
  if (!question) {
    const error = new Error("Question not found");
    error.status = 404;
    throw error;
  }

  const nextChoices = question.choices.filter((choice) => choice.value !== optionValue);
  if (nextChoices.length < 2) {
    const error = new Error("A question must keep at least 2 options");
    error.status = 400;
    throw error;
  }

  question.choices = nextChoices;
  await question.save();
  return question.toObject();
}

module.exports = {
  createQuestion,
  deleteQuestion,
  deleteQuestionOption,
  sanitizeLeanQuestion,
};
