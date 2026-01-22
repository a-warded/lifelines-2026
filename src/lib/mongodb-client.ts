import { MongoClient } from "mongodb";

function getMongoUri() {
  const {
    NODE_ENV,
    MONGO_INITDB_ROOT_USERNAME,
    MONGO_INITDB_ROOT_PASSWORD,
    MONGO_DB_NAME,
  } = process.env;

  const isDev = NODE_ENV !== "production";
  const host = isDev ? "origin.a-warded.org" : "lifelines_mongo";
  const port = isDev ? 202 : 27017;
  const dbName = MONGO_DB_NAME || "lifelines";

  if (!MONGO_INITDB_ROOT_USERNAME) {
    throw new Error("Missing MONGO_INITDB_ROOT_USERNAME");
  }
  if (!MONGO_INITDB_ROOT_PASSWORD) {
    throw new Error("Missing MONGO_INITDB_ROOT_PASSWORD");
  }

  const user = encodeURIComponent(MONGO_INITDB_ROOT_USERNAME);
  const pass = encodeURIComponent(MONGO_INITDB_ROOT_PASSWORD);

  return `mongodb://${user}:${pass}@${host}:${port}/${dbName}?authSource=admin`;
}

const options = {};

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

function getClientPromise(): Promise<MongoClient> {
  if (clientPromise) {
    return clientPromise;
  }

  const uri = getMongoUri();

  if (process.env.NODE_ENV === "development") {
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }

  return clientPromise;
}

// Export a proxy that lazily creates the connection
const clientPromiseProxy = new Proxy({} as Promise<MongoClient>, {
  get(_, prop) {
    const promise = getClientPromise();
    return Reflect.get(promise, prop, promise);
  },
});

export default clientPromiseProxy;
