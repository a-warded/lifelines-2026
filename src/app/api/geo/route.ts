import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// GET - get users country from cloudflare header (fallback for no gps). lowkey hacky but it works
export async function GET(request: NextRequest) {
    try {
        const headersList = await headers();
        
        // cloudflare provides CF-IPCountry header. ty cloudflare ur a real one
        const cfCountry = headersList.get("cf-ipcountry");
        
        // fallback to other headers if available. gotta have a backup plan
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
