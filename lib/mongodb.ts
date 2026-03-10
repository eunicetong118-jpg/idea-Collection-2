import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {
  tls: true,
  tlsInsecure: true,
};

let client;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  if (process.env.NODE_ENV === "production") {
    console.warn('Invalid/Missing environment variable: "MONGODB_URI". Building without connection.');
    // In production build, provide a dummy promise that won't resolve.
    // This allows the build to finish even if variables are missing on the build server.
    clientPromise = new Promise(() => {});
  } else {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
  }
} else if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

export async function getDb() {
  const client = await clientPromise;
  // Use the database name from the URI if available, otherwise default to "idea-collection"
  return client.db("idea-collection");
}
