const { getDb } = require("../db");

function collection() {
  return getDb().collection("student_accounts");
}

module.exports = { collection };
