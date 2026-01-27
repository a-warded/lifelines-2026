import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    // try to get ip from cloudflare header, fallback to random number. bruh
    const cfIp = request.headers.get("CF-Connecting-IP");
    
    if (cfIp) {
        return NextResponse.json({ ip: cfIp });
    }
    
    // fallback to random number cause we cant always get the ip. its whatever
    const randomId = Math.floor(Math.random() * 1000000);
    return NextResponse.json({ ip: `${randomId}` });
}
