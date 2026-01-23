// WARNING: Whoever touches this file needs to make sure that it build without a .env file present
// Docker build does not contain environment variables, any errors should be thrown at runtime, not build time
// https://media1.tenor.com/m/r57P_q9DDycAAAAC/futaba-bunny-girl-senpai.gif

import { MongoClient, MongoClientOptions } from "mongodb";
import mongoose from "mongoose";

let cached = (global as any).mongoose;
if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

let mongoClientCached = (global as any)._mongoClient;
if (!mongoClientCached) {
    mongoClientCached = (global as any)._mongoClient = { client: null, promise: null };
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

function createMongoClientPromise() {
    if (mongoClientCached.client) return Promise.resolve(mongoClientCached.client);

    const uri = getMongoUri();

    if (!mongoClientCached.promise) {
        const options: MongoClientOptions = { serverSelectionTimeoutMS: 8000 };
        const client = new MongoClient(uri, options);
        mongoClientCached.promise = client.connect().then(() => {
            mongoClientCached.client = client;
            return client;
        });
    }

    return mongoClientCached.promise;
}

// Official MongoDB client for auth mainly
export const clientPromise: any = {
    then: (onfulfilled: any, onrejected: any) => createMongoClientPromise().then(onfulfilled, onrejected),
    catch: (onrejected: any) => createMongoClientPromise().catch(onrejected),
    finally: (onfinally: any) => createMongoClientPromise().finally(onfinally),
};
