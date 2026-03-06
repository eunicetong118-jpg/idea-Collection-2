import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import clientPromise from "@/lib/mongodb";

export async function checkSimilarity(text: string) {
  if (!process.env.GOOGLE_API_KEY) {
    console.warn("GOOGLE_API_KEY is not set. Skipping similarity check.");
    return null;
  }

  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY,
    modelName: "embedding-001", // Default Google embedding model
    taskType: TaskType.RETRIEVAL_QUERY,
  });

  const queryVector = await embeddings.embedQuery(text);

  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection("ideas");

  // MongoDB Atlas Vector Search
  // Assumes a vector index named "vector_index" on the "embedding" field
  const results = await collection.aggregate([
    {
      "$vectorSearch": {
        "index": "vector_index",
        "path": "embedding",
        "queryVector": queryVector,
        "numCandidates": 100,
        "limit": 1
      }
    },
    {
      "$project": {
        "_id": 1,
        "title": 1,
        "description": 1,
        "score": { "$meta": "vectorSearchScore" }
      }
    }
  ]).toArray();

  if (results.length > 0) {
    const mostSimilar = results[0];
    if (mostSimilar.score > 0.70) {
      return mostSimilar;
    }
  }

  return null;
}

export async function generateEmbedding(text: string) {
  if (!process.env.GOOGLE_API_KEY) {
    return null;
  }

  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY,
    modelName: "embedding-001",
    taskType: TaskType.RETRIEVAL_DOCUMENT,
  });

  return await embeddings.embedQuery(text);
}
