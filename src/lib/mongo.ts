import mongoose from "mongoose";

const {
    NODE_ENV,
    MONGO_INITDB_ROOT_USERNAME,
    MONGO_INITDB_ROOT_PASSWORD,
    MONGO_DB_NAME,
} = process.env;

const isDev = NODE_ENV !== "production";

// lifelines_mongo is the container name that resolves via Docker's internal DNS thingy
// origin.a-warded.org is the prod url
// yes I test in prod like a true sigma 
const host = isDev ? "origin.a-warded.org" : "lifelines_mongo";

// sigma port
const port = 202;

const dbName = MONGO_DB_NAME || "lifelines";

if (!MONGO_INITDB_ROOT_USERNAME) {
    throw new Error("Missing MONGO_INITDB_ROOT_USERNAME (rip)");
}

if (!MONGO_INITDB_ROOT_PASSWORD) {
    throw new Error("Missing MONGO_INITDB_ROOT_PASSWORD (rip)");
}

// build connection string from parts
const MONGODB_URI = `mongodb://${encodeURIComponent(
    MONGO_INITDB_ROOT_USERNAME,
)}:${encodeURIComponent(
    MONGO_INITDB_ROOT_PASSWORD,
)}@${host}:${port}/${dbName}?authSource=admin`;

let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectMongo() {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose
            .connect(MONGODB_URI, {
                serverSelectionTimeoutMS: 8000,
            })
            .then((m) => m);
    }

    cached.conn = await cached.promise;
    return cached.conn;
}
