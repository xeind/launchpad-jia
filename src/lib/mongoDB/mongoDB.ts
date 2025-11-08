import { MongoClient } from "mongodb";

let uri = process.env.MONGODB_URI;
let dbName = "jia-db";

let cachedClient = null;
let cachedDb = null;

if (!uri) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

if (!dbName) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

export default async function connectMongoDB() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    // Parse the connection string to add/modify parameters
    const connectionString = uri.includes('?') 
      ? `${uri}&tlsAllowInvalidCertificates=true&tlsAllowInvalidHostnames=true`
      : `${uri}?tlsAllowInvalidCertificates=true&tlsAllowInvalidHostnames=true`;

    const client = await MongoClient.connect(connectionString, {
      minPoolSize: 1,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 30000,
    });

    const db = client.db(dbName);

    cachedClient = client;
    cachedDb = db;

    console.log('MongoDB connected successfully');
    return { client, db };
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
}

export async function disconnectFromDatabase() {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
  }
}
