import { I18nProvider } from "@/components/providers/i18n-provider";
import { OfflineProvider } from "@/components/providers/offline-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Sans_Arabic, Sora } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const sora = Sora({
    variable: "--font-sora",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const notoSansArabic = Noto_Sans_Arabic({
    variable: "--font-noto-arabic",
    subsets: ["arabic"],
    weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
    title: "FADES",
    description: "Food, Agriculture, and Distribution Ecosystem - Smart farming with offline support",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "FADES",
    },
    formatDetection: {
        telephone: false,
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: "#16a34a",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="apple-touch-icon" href="/images/icon-192.png" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="mobile-web-app-capable" content="yes" />
            </head>
            <body
                className={`${sora.variable} ${geistSans.variable} ${geistMono.variable} ${notoSansArabic.variable} antialiased`}
            >
                <SessionProvider>
                    <I18nProvider>
                        <OfflineProvider>{children}</OfflineProvider>
                    </I18nProvider>
                </SessionProvider>
            </body>
        </html>
    );
}
