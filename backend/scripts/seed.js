require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const bcrypt = require("bcryptjs");
const { connectDatabases, getDb } = require("../db");
const AdminAccount = require("../models/AdminAccount");
const StudentAccount = require("../models/StudentAccount");
const Question = require("../models/Question");
const Response = require("../models/Response");
const Result = require("../models/Result");
const { getSeedQuestions } = require("../data/questionBank");

async function dropCollectionIfExists(collectionName) {
  const db = getDb();
  const snapshot = await db.collection(collectionName).get();
  
  // Note: For very large collections this batch could exceed the 500 operation limit,
  // but for seeding purposes this is sufficient.
  if (snapshot.docs.length > 0) {
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  }
}

async function recreateCollections() {
  await Promise.all([
    dropCollectionIfExists("admin_accounts"),
    dropCollectionIfExists("student_accounts"),
    dropCollectionIfExists("questions"),
    dropCollectionIfExists("responses"),
    dropCollectionIfExists("results"),
  ]);
}

async function seedAdmin() {
  const password = await bcrypt.hash("AdminCareerguide!123", 10);
  await AdminAccount.collection().add({
    username: "admin@careerguide",
    password,
    role: "admin",
    createdAt: new Date()
  });
}

async function seedQuestions() {
  const questions = getSeedQuestions();
  const batch = getDb().batch();
  questions.forEach(q => {
    if (!q.createdAt) q.createdAt = new Date();
    const ref = Question.collection().doc();
    batch.set(ref, q);
  });
  await batch.commit();
  return questions;
}

async function seedDemoStudents() {
  const password = await bcrypt.hash("demo123", 10);
  const demos = [
    { name: "Aarav Sharma", email: "aarav.demo@gmail.com" },
    { name: "Diya Patel", email: "diya.demo@gmail.com" },
    { name: "Rohan Verma", email: "rohan.demo@gmail.com" },
  ];
  const batch = getDb().batch();
  demos.forEach(d => {
    const ref = StudentAccount.collection().doc();
    batch.set(ref, { ...d, password, role: "student", status: "pending", createdAt: new Date() });
  });
  await batch.commit();
  return demos.length;
}

(async () => {
  const withDemoStudents = process.argv.includes("--with-demo-students");
  await connectDatabases();
  
  console.log("Clearing existing collections...");
  await recreateCollections();
  
  console.log("Seeding data...");
  await seedAdmin();
  const seededQuestions = await seedQuestions();
  const demoStudentCount = withDemoStudents ? await seedDemoStudents() : 0;

  const counts = {
    admin_accounts: (await AdminAccount.collection().count().get()).data().count,
    student_accounts: (await StudentAccount.collection().count().get()).data().count,
    questions: (await Question.collection().count().get()).data().count,
    responses: (await Response.collection().count().get()).data().count,
    results: (await Result.collection().count().get()).data().count,
  };

  console.log("Databases created: Firebase Firestore");
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
  if (withDemoStudents) {
    console.log(`Confirmed ${demoStudentCount} demo student accounts seeded (password: demo123)`);
  }

  process.exit(0);
})().catch(error => {
  console.error(error);
  process.exit(1);
});
