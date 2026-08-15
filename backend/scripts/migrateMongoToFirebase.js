require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const { MongoClient, ObjectId } = require("mongodb");
const { connectDatabases, getDb } = require("../db");

function sanitizeDoc(obj) {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof ObjectId) return obj.toString();
  if (obj instanceof Date) return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeDoc);
  if (typeof obj === "object") {
    const newObj = {};
    for (const key of Object.keys(obj)) {
      if (key === "_id" || key === "__v") continue; // We strip these at top level
      newObj[key] = sanitizeDoc(obj[key]);
    }
    return newObj;
  }
  return obj;
}

async function migrate() {
  console.log("Initializing Firebase connection...");
  await connectDatabases();
  const firestore = getDb();

  console.log("Connecting to MongoDB...");
  const mongoClient = new MongoClient(process.env.MONGODB_URI);
  await mongoClient.connect();
  console.log("Connected to MongoDB.");

  const dbAdmin = mongoClient.db(process.env.DB_ADMIN);
  const dbStudents = mongoClient.db(process.env.DB_STUDENTS);

  async function migrateCollection(mongoDb, collectionName) {
    console.log(`\nMigrating collection: ${collectionName}...`);
    const collection = mongoDb.collection(collectionName);
    const docs = await collection.find({}).toArray();
    
    if (docs.length === 0) {
      console.log(`No documents found in ${collectionName}.`);
      return;
    }

    let batch = firestore.batch();
    let count = 0;
    let total = 0;

    for (const doc of docs) {
      const id = doc._id.toString();
      const sanitizedDoc = sanitizeDoc(doc);
      
      const ref = firestore.collection(collectionName).doc(id);
      batch.set(ref, sanitizedDoc);
      
      count++;
      total++;

      if (count === 400) {
        await batch.commit();
        batch = firestore.batch();
        count = 0;
      }
    }
    
    if (count > 0) {
      await batch.commit();
    }
    
    console.log(`Successfully migrated ${total} documents into ${collectionName}.`);
  }

  try {
    await migrateCollection(dbAdmin, "admin_accounts");
    await migrateCollection(dbAdmin, "student_accounts");
    await migrateCollection(dbAdmin, "questions");
    await migrateCollection(dbStudents, "responses");
    await migrateCollection(dbStudents, "results");
    
    console.log("\n✅ FULL MIGRATION COMPLETE!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoClient.close();
    process.exit(0);
  }
}

migrate();
