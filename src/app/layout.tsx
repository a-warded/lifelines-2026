import { I18nProvider } from "@/components/providers/i18n-provider";
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
    description: "Lifelines 2026",
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${sora.variable} ${geistSans.variable} ${geistMono.variable} ${notoSansArabic.variable} antialiased`}
            >
                <SessionProvider>
                    <I18nProvider>{children}</I18nProvider>
                </SessionProvider>
            </body>
        </html>
    );
}
