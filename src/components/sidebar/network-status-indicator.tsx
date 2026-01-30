"use client";

import { useOnlineStatus } from "@/hooks/use-offline";
import { Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export function NetworkStatusIndicator() {
    const isOnline = useOnlineStatus();
    const { t } = useTranslation();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Avoid hydration mismatch
    if (!mounted) {
        return (
            <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm">
                <div className="h-5 w-5 animate-pulse rounded bg-muted" />
                <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            </div>
        );
    }

    return (
        <div
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors duration-300 ${
                isOnline
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-amber-600 dark:text-amber-400"
            }`}
        >
            {isOnline ? (
                <>
                    <Wifi className="h-5 w-5" />
                    <span className="font-medium">{t("status.online", "Online")}</span>
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                </>
            ) : (
                <>
                    <WifiOff className="h-5 w-5" />
                    <span className="font-medium">{t("status.offline", "Offline")}</span>
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                    </span>
                </>
            )}
        </div>
    );
}
