import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    // Try to get IP from Cloudflare header, fallback to random number
    const cfIp = request.headers.get("CF-Connecting-IP");
    
    if (cfIp) {
        return NextResponse.json({ ip: cfIp });
    }
    
    // Fallback to random number
    const randomId = Math.floor(Math.random() * 1000000);
    return NextResponse.json({ ip: `${randomId}` });
}
