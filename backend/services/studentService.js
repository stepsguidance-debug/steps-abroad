const Result = require("../models/Result");
const Response = require("../models/Response");
const StudentAccount = require("../models/StudentAccount");

async function deleteStudent(userId) {
  const db = require("../db").getDb();
  const batch = db.batch();

  const results = await Result.collection().where("userId", "==", userId).get();
  results.docs.forEach(doc => batch.delete(doc.ref));

  const responses = await Response.collection().where("userId", "==", userId).get();
  responses.docs.forEach(doc => batch.delete(doc.ref));

  batch.delete(StudentAccount.collection().doc(userId));

  await batch.commit();
}

module.exports = { deleteStudent };
