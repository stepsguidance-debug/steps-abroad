const mongoose = require("mongoose");

function withDatabaseName(baseUri, dbName) {
  const [beforeQuery, query = ""] = baseUri.split("?");
  const normalized = beforeQuery.endsWith("/") ? beforeQuery.slice(0, -1) : beforeQuery;
  return `${normalized}/${dbName}${query ? `?${query}` : ""}`;
}

const baseUri = process.env.MONGODB_URI;
const adminDbName = process.env.DB_ADMIN || "stepsguidance_admin";
const studentDbName = process.env.DB_STUDENTS || "stepsguidance_students";

if (!baseUri) {
  throw new Error("MONGODB_URI is required");
}

const adminUri = withDatabaseName(baseUri, adminDbName);
const studentUri = withDatabaseName(baseUri, studentDbName);

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
  adminDbName,
  studentDbName,
  connectDatabases,
  disconnectDatabases,
};
