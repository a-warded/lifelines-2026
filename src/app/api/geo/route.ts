import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// GET - Get user's country from Cloudflare header (fallback for no GPS)
export async function GET(request: NextRequest) {
    try {
        const headersList = await headers();
        
        // Cloudflare provides CF-IPCountry header
        const cfCountry = headersList.get("cf-ipcountry");
        
        // Fallback to other headers if available
        const xCountry = headersList.get("x-vercel-ip-country");
        
        const country = cfCountry || xCountry || "US";
        
        return NextResponse.json({
            country: country.toUpperCase(),
            source: cfCountry ? "cloudflare" : xCountry ? "vercel" : "default",
        });
    } catch (error) {
        console.error("Error getting country:", error);
        return NextResponse.json({ 
            country: "US",
            source: "fallback",
        });
    }
}
