const { getDb } = require("../db");

function collection() {
  return getDb().collection("responses");
}

module.exports = { collection };
