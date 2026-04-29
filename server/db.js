const mongoose = require("mongoose");

function withDatabaseName(baseUri, dbName) {
  const [beforeQuery, query = ""] = baseUri.split("?");
  const normalized = beforeQuery.endsWith("/") ? beforeQuery.slice(0, -1) : beforeQuery;
  return `${normalized}/${dbName}${query ? `?${query}` : ""}`;
}

const baseUri = process.env.MONGODB_URI;

if (!baseUri) {
  throw new Error("MONGODB_URI is required");
}

const adminUri = withDatabaseName(baseUri, "stepsguidance_admin");
const studentUri = withDatabaseName(baseUri, "stepsguidance_students");

const adminConnection = mongoose.createConnection(adminUri);
const studentConnection = mongoose.createConnection(studentUri);

async function connectDatabases() {
  await Promise.all([adminConnection.asPromise(), studentConnection.asPromise()]);
  return {
    admin: adminConnection.name,
    students: studentConnection.name,
  };
}

async function disconnectDatabases() {
  await Promise.all([adminConnection.close(), studentConnection.close()]);
}

module.exports = {
  adminConnection,
  studentConnection,
  adminUri,
  studentUri,
  connectDatabases,
  disconnectDatabases,
};
