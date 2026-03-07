import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config({ path: ".env.local" });

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  console.log("Testing connection with URI:", uri);

  if (!uri || !uri.startsWith("mongodb")) {
    console.error("FAILURE: MONGODB_URI is invalid or missing in .env.local.");
    process.exit(1);
  }

  try {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db("idea-collection");
    const collections = await db.listCollections().toArray();
    console.log("SUCCESS: Connected to MongoDB!");
    console.log("Available collections:", collections.map(c => c.name));
    await client.close();
    process.exit(0);
  } catch (error) {
    console.error("FAILURE: Could not connect to MongoDB.");
    console.error("Error details:", error.message);
    process.exit(1);
  }
}

testConnection();
