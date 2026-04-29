const Result = require("../models/Result");
const Response = require("../models/Response");
const StudentAccount = require("../models/StudentAccount");

async function deleteStudent(userId) {
  await Result.deleteOne({ userId });
  await Response.deleteMany({ userId });
  await StudentAccount.deleteOne({ _id: userId });
}

module.exports = { deleteStudent };
