require("dotenv").config();
const bcrypt = require("bcryptjs");
const { connectDatabases, disconnectDatabases, adminConnection, studentConnection } = require("../db");
const AdminAccount = require("../models/AdminAccount");
const StudentAccount = require("../models/StudentAccount");
const Question = require("../models/Question");
const Response = require("../models/Response");
const Result = require("../models/Result");
const { getSeedQuestions } = require("../data/questionBank");

async function dropCollectionIfExists(connection, name) {
  const exists = (await connection.db.listCollections({ name }).toArray()).length > 0;
  if (exists) {
    await connection.dropCollection(name);
  }
}

async function recreateCollections() {
  await Promise.all([
    dropCollectionIfExists(adminConnection, "admin_accounts"),
    dropCollectionIfExists(adminConnection, "student_accounts"),
    dropCollectionIfExists(adminConnection, "questions"),
    dropCollectionIfExists(studentConnection, "responses"),
    dropCollectionIfExists(studentConnection, "results"),
  ]);

  await Promise.all([
    AdminAccount.createCollection(),
    StudentAccount.createCollection(),
    Question.createCollection(),
    Response.createCollection(),
    Result.createCollection(),
  ]);

  await Promise.all([
    AdminAccount.syncIndexes(),
    StudentAccount.syncIndexes(),
    Question.syncIndexes(),
    Response.syncIndexes(),
    Result.syncIndexes(),
  ]);
}

async function seedAdmin() {
  const password = await bcrypt.hash("admin123", 10);
  await AdminAccount.create({
    username: "admin",
    password,
    role: "admin",
  });
}

async function seedQuestions() {
  const questions = getSeedQuestions();
  await Question.insertMany(questions);
  return questions;
}

(async () => {
  await connectDatabases();
  await recreateCollections();
  await seedAdmin();
  const seededQuestions = await seedQuestions();

  const counts = {
    admin_accounts: await AdminAccount.countDocuments(),
    student_accounts: await StudentAccount.countDocuments(),
    questions: await Question.countDocuments(),
    responses: await Response.countDocuments(),
    results: await Result.countDocuments(),
  };

  console.log("Databases created: stepsguidance_admin, stepsguidance_students");
  console.log(`admin_accounts: ${counts.admin_accounts}`);
  console.log(`student_accounts: ${counts.student_accounts}`);
  console.log(`questions: ${counts.questions}`);
  console.log(`responses: ${counts.responses}`);
  console.log(`results: ${counts.results}`);

  const sectionCounts = seededQuestions.reduce((acc, question) => {
    acc[question.section] = (acc[question.section] || 0) + 1;
    return acc;
  }, {});
  console.log(`Confirmed ${seededQuestions.length} questions seeded across sections A-G: ${JSON.stringify(sectionCounts)}`);
  console.log("Confirmed 1 admin account seeded");

  await disconnectDatabases();
})().catch(async (error) => {
  console.error(error);
  await disconnectDatabases().catch(() => {});
  process.exit(1);
});
