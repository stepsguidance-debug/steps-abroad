const { getDb } = require("../db");

function collection() {
  return getDb().collection("results");
}

module.exports = { collection };
