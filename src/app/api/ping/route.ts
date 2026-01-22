import { connectMongo } from "@/lib/mongo";
import { NextResponse } from "next/server";

export async function GET() {
    const time = new Date().toISOString();

    try {
        const conn = await connectMongo();

        // Check mongo (those who know)
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
                error: err?.message ?? "Unknown error", // Womp womp
            },
            { status: 503 },
        );
    }
}
