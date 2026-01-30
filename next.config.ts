import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    
    // Enable PWA-like behavior with smart caching headers
    async headers() {
        return [
            {
                // Cache static assets aggressively
                source: "/:path*.(ico|png|jpg|jpeg|gif|webp|svg|woff|woff2|ttf|eot)",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "public, max-age=31536000, immutable",
                    },
                ],
            },
            {
                // Service worker should not be cached
                source: "/sw.js",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "no-cache, no-store, must-revalidate",
                    },
                    {
                        key: "Service-Worker-Allowed",
                        value: "/",
                    },
                ],
            },
            {
                // API routes should have short cache with revalidation
                source: "/api/:path*",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "private, max-age=0, must-revalidate",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
