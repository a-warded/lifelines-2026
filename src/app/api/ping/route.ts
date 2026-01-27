import { connectMongo } from "@/lib/mongo";
import { NextResponse } from "next/server";

export async function GET() {
    const time = new Date().toISOString();

    try {
        const conn = await connectMongo();

        // check mongo (those who know). bruh
        const ping = await conn.connection.db.admin().ping();

        return NextResponse.json(
            {
                ok: true,
                time,
                mongo: {
                    ok: true,
                    ping,
                    host: conn.connection.host,
                    name: conn.connection.name,
                    readyState: conn.connection.readyState, // 1 means connected
                },
            },
            { status: 200 },
        );
    } catch (err: any) {
        return NextResponse.json(
            {
                ok: false,
                time,
                mongo: {
                    ok: false,
                },
                error: err?.message ?? "Unknown error", // womp womp ts pmo
            },
            { status: 503 },
        );
    }
}
