const { getDb } = require("../db");

function collection() {
  return getDb().collection("admin_accounts");
}

module.exports = { collection };
