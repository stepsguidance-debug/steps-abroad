const Question = require("../models/Question");
const { sectionTitles } = require("../data/questionBank");

function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || `choice_${Date.now()}`;
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

  return {
    label,
    value: String(choice.value || slugify(label)),
    allowCustomInput: Boolean(choice.allowCustomInput),
    customInputPlaceholder: String(choice.customInputPlaceholder || "").trim(),
    weights: normalizeWeights(choice.weights),
  };
}

function normalizeQuestionInput(input) {
  const section = String(input.section || "").trim();
  const questionText = String(input.questionText || "").trim();
  const layer = String(input.layer || "").trim();
  const type = String(input.type || "").trim();

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
  const order = await Question.countDocuments() + 1;
  const created = await Question.create({ ...normalized, order });
  return created.toObject();
}

async function deleteQuestion(questionId) {
  await Question.findByIdAndDelete(questionId);
  await resequenceQuestions();
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
};
