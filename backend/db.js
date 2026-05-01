const mongoose = require("mongoose");

function withDatabaseName(baseUri, dbName) {
  const [beforeQuery, query = ""] = baseUri.split("?");
  const normalized = beforeQuery.endsWith("/") ? beforeQuery.slice(0, -1) : beforeQuery;
  return `${normalized}/${dbName}${query ? `?${query}` : ""}`;
}

const adminDbName = process.env.DB_ADMIN || "stepsguidance_admin";
const studentDbName = process.env.DB_STUDENTS || "stepsguidance_students";

function resolveBaseUri() {
  return process.env.MONGODB_URI;
}

const adminConnection = mongoose.createConnection();
const studentConnection = mongoose.createConnection();

async function openBothConnections(baseUri) {
  const adminUri = withDatabaseName(baseUri, adminDbName);
  const studentUri = withDatabaseName(baseUri, studentDbName);

  await Promise.all([
    adminConnection.readyState === 1 ? Promise.resolve() : adminConnection.openUri(adminUri),
    studentConnection.readyState === 1 ? Promise.resolve() : studentConnection.openUri(studentUri),
  ]);
  return { adminUri, studentUri };
}

async function connectDatabases() {
  const baseUri = resolveBaseUri();

  if (!baseUri) {
    throw new Error("MONGODB_URI is required in backend/.env");
  }

  try {
    await openBothConnections(baseUri);
  } catch (err) {
    const msg = err?.message || String(err);
    if (process.env.NODE_ENV !== "production" && msg.includes("ECONNREFUSED")) {
      const hint = [
        "MongoDB is not reachable on the configured host.",
        "Fix by either:",
        "1) Start your MongoDB instance, OR",
        "2) Set MONGODB_URI in backend/.env to a valid connection string.",
      ].join(" ");
      const e = new Error(`${hint} Original error: ${msg}`);
      e.cause = err;
      throw e;
    }
    throw err;
  }

  return { admin: adminConnection.name, students: studentConnection.name };
}

async function disconnectDatabases() {
  await Promise.all([adminConnection.close(), studentConnection.close()]);
}

module.exports = {
  adminConnection,
  studentConnection,
  adminDbName,
  studentDbName,
  connectDatabases,
  disconnectDatabases,
};
