"use client";

import { Droplets, Shield, Sprout, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function Home() {
    const { data: session, status } = useSession();
    const { t } = useTranslation();

    const features = [
        {
            icon: Sprout,
            title: t("landing.features.plan.title"),
            description: t("landing.features.plan.description"),
        },
        {
            icon: Users,
            title: t("landing.features.exchange.title"),
            description: t("landing.features.exchange.description"),
        },
        {
            icon: Droplets,
            title: t("landing.features.water.title"),
            description: t("landing.features.water.description"),
        },
        {
            icon: Shield,
            title: t("landing.features.assistant.title"),
            description: t("landing.features.assistant.description"),
        },
    ];

    return (
        <div className="sm:mx-auto sm:w-full sm:max-w-sm min-h-screen flex flex-col items-center justify-center">
            <img src="/images/logo_wordmark_full.png" alt="FADES Logo" />
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
    );
}
