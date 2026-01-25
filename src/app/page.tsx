"use client";

import ColorBends from "@/components/ColorBends";
import SplitText from "@/components/SplitText";
import { FadesLogo } from "@/components/fades-logo";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function Home() {
    const { data: session, status } = useSession();
    const { t } = useTranslation();

    return (
        <div className="relative w-full min-h-screen bg-[#212121]">

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
                    className="text-2xl font-semibold text-center text-background"
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
                        <>
                            <Link
                                href="/login"
                                className="rounded-lg bg-primary px-8 py-3 font-medium text-primary-foreground transition-colors hover:opacity-90"
                            >
                                {t("nav.signIn")}
                            </Link>
                            <Link
                                href="/register"
                                className="rounded-lg border border-border bg-background px-8 py-3 font-medium transition-colors hover:bg-card"
                            >
                                {t("nav.register")}
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
