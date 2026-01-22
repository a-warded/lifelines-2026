import mongoose from "mongoose";

let cached = (global as any).mongoose;
if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

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

export async function connectMongo() {
    if (cached.conn) return cached.conn;

    const uri = getMongoUri();

    if (!cached.promise) {
        cached.promise = mongoose
            .connect(uri, {
                serverSelectionTimeoutMS: 8000,
            })
            .then((m) => m);
    }

    cached.conn = await cached.promise;
    return cached.conn;
}
