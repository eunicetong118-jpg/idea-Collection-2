import { OllamaEmbeddings } from "@langchain/ollama";
import clientPromise from "@/lib/mongodb";

export async function checkSimilarity(text: string) {
  try {
    const embeddings = new OllamaEmbeddings({
      model: "llama3.2:latest",
      baseUrl: "http://localhost:11434",
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
  } catch (error: any) {
    console.error("Similarity check error (Local Ollama):", error.message || error);
    return null;
  }

  return null;
}

export async function generateEmbedding(text: string) {
  try {
    const embeddings = new OllamaEmbeddings({
      model: "llama3.2:latest",
      baseUrl: "http://localhost:11434",
    });

    return await embeddings.embedQuery(text);
  } catch (error: any) {
    console.error("Embedding generation error (Local Ollama):", error.message || error);
    // Return a dummy embedding (768 dimensions for nomic-embed-text) to prevent app crash
    return new Array(768).fill(0);
  }
}
