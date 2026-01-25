"use client";

import ColorBends from "@/components/ColorBends";
import SplitText from "@/components/SplitText";
import { FadesLogo } from "@/components/fades-logo";
import { Button } from "@/components/ui";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function Home() {
    const { data: session, status } = useSession();
    const { t } = useTranslation();
    const router = useRouter();
    const [isCreatingDemo, setIsCreatingDemo] = useState(false);

    const generateGuid = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    const handleCreateDemoAccount = async () => {
        setIsCreatingDemo(true);
        try {
            // Get user's IP address from server (uses CF-Connecting-IP or random fallback)
            let ipAddress = "unknown";
            try {
                const ipResponse = await fetch("/api/ip");
                const ipData = await ipResponse.json();
                ipAddress = ipData.ip;
            } catch {
                // Fallback if IP fetch fails
                ipAddress = `${Math.floor(Math.random() * 1000000)}`;
            }

            const demoEmail = `${generateGuid()}@demo.acc`;
            const demoPassword = "demo@2026!";
            const demoName = `Demo User ${ipAddress}`;

            // Create the demo account
            const registerResponse = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: demoEmail,
                    name: demoName,
                    password: demoPassword,
                }),
            });

            if (!registerResponse.ok) {
                throw new Error("Failed to create demo account");
            }

            // Sign in with the demo account
            const signInResult = await signIn("credentials", {
                email: demoEmail,
                password: demoPassword,
                redirect: false,
            });

            if (signInResult?.error) {
                throw new Error("Failed to sign in to demo account");
            }

            // Redirect to onboarding
            router.push("/onboarding");
        } catch (error) {
            console.error("Demo account creation error:", error);
            alert("Failed to create demo account. Please try again.");
        } finally {
            setIsCreatingDemo(false);
        }
    };

    // Force dark mode for this page
    useEffect(() => {
        document.documentElement.classList.add("dark");
        return () => {
            document.documentElement.classList.remove("dark");
        };   
    }, []);

    return (
        <div className="relative w-full min-h-screen">

            <ColorBends
                colors={["#0fff83"]}
                rotation={0}
                speed={0.2}
                scale={1}
                frequency={1}
                warpStrength={1}
                mouseInfluence={1}
                parallax={0.5}
                noise={0.1}
                transparent
                autoRotate={0}
                className="fixed left-0 top-0 h-full w-full opacity-30"
            />


            <div className="z-10 relative sm:mx-auto sm:w-full sm:max-w-sm min-h-screen flex flex-col items-center justify-center">

                <div className="fades-fancy-ahh flex flex-col items-center mb-8">
                    <FadesLogo fill="var(--primary)" className="px-12"/>
                    <h1 className="text-8xl text-primary font-bold" >FADES</h1>
                </div>

                <SplitText
                    text="Food, Agriculture, and Distribution Ecosystem"
                    className="text-2xl font-semibold text-center"
                    duration={1.25}
                    ease="power3.out"
                    splitType="chars"
                    from={{ opacity: 0, y: 40 }}
                    to={{ opacity: 1, y: 0 }}
                    threshold={0.1}
                    rootMargin="-100px"
                    textAlign="center"
                />

                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
                    {status === "loading" ? (
                        <div className="h-12 w-32 animate-pulse rounded-lg bg-card" />
                    ) : session ? (
                        <Link
                            href="/dashboard"
                            className="rounded-lg bg-primary px-8 py-3 font-medium text-primary-foreground transition-colors hover:opacity-90"
                        >
                            {t("landing.cta.dashboard")}
                        </Link>
                    ) : (
                        <div className="flex flex-col items-center gap-4">
                            <Button 
                                onClick={handleCreateDemoAccount}
                                disabled={isCreatingDemo}
                            >
                                {isCreatingDemo ? t("common.loading") || "Loading..." : t("auth.register.demo")}
                            </Button>
                            <div className="flex gap-2 opacity-80">
                                <p>OR</p>
                                <Link
                                    href="/login"
                                    className="text-sm rounded-lg bg-primary px-2 font-medium text-primary-foreground transition-colors hover:opacity-90"
                                >
                                    {t("nav.signIn")}
                                </Link>
                                <Link
                                    href="/register"
                                    className="text-sm rounded-lg border border-border bg-background px-2 font-medium transition-colors hover:bg-card"
                                >
                                    {t("nav.register")}
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
