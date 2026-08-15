const { initializeApp, getApps, applicationDefault, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

let db;

async function connectDatabases() {
  if (getApps().length === 0) {
    if (process.env.FIREBASE_PRIVATE_KEY) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        })
      });
    } else {
      initializeApp({
        credential: applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID || "steps-guidance-demo",
      });
    }
  }
  db = getFirestore();
  console.log("Firebase Firestore connected.");
  return { db };
}

async function disconnectDatabases() {
  return Promise.resolve();
}

function getDb() {
  if (!db) {
    db = getFirestore();
  }
  return db;
}

module.exports = {
  connectDatabases,
  disconnectDatabases,
  getDb
};
