const { getDb } = require("../db");

function collection() {
  return getDb().collection("questions");
}

module.exports = { collection };
