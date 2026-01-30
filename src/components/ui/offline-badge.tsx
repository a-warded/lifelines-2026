"use client";

import { useOnlineStatus } from "@/hooks/use-offline";
import { Cloud, CloudOff, RefreshCw, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface OfflineBadgeProps {
    showWhenOnline?: boolean;
    className?: string;
}

export function OfflineBadge({ showWhenOnline = false, className = "" }: OfflineBadgeProps) {
    const isOnline = useOnlineStatus();
    const { t } = useTranslation();
    const [hasPendingSync, setHasPendingSync] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Check for pending offline queue items
    useEffect(() => {
        if (typeof window === "undefined") return;

        const checkPendingQueue = () => {
            const queueData = localStorage.getItem("farm_offline_queue");
            if (queueData) {
                try {
                    const queue = JSON.parse(queueData);
                    setHasPendingSync(Array.isArray(queue) && queue.length > 0);
                } catch {
                    setHasPendingSync(false);
                }
            } else {
                setHasPendingSync(false);
            }
        };

        checkPendingQueue();
        
        // Check periodically
        const interval = setInterval(checkPendingQueue, 5000);
        return () => clearInterval(interval);
    }, [isOnline]);

    // Show transition animation
    useEffect(() => {
        setIsTransitioning(true);
        const timer = setTimeout(() => setIsTransitioning(false), 2000);
        return () => clearTimeout(timer);
    }, [isOnline]);

    // Avoid hydration mismatch
    if (!mounted) return null;

    // Show syncing status when coming back online with pending items
    if (isOnline && hasPendingSync) {
        return (
            <div className={`fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transform ${className}`}>
                <div className="flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-lg animate-pulse">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>{t("status.syncing", "Syncing...")}</span>
                </div>
            </div>
        );
    }

    // Show brief "back online" message
    if (isOnline && isTransitioning) {
        return (
            <div className={`fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transform ${className}`}>
                <div className="flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-lg animate-in fade-in slide-in-from-bottom-2">
                    <Cloud className="h-4 w-4" />
                    <span>{t("status.backOnline", "Back Online")}</span>
                </div>
            </div>
        );
    }

    // Don't show when online unless explicitly requested
    if (isOnline && !showWhenOnline) return null;

    // Show online status if requested
    if (isOnline && showWhenOnline) {
        return (
            <div className={`flex items-center gap-2 text-emerald-600 ${className}`}>
                <Cloud className="h-4 w-4" />
                <span className="text-sm">{t("status.online", "Online")}</span>
            </div>
        );
    }

    // Show offline warning
    return (
        <div className={`fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transform ${className}`}>
            <div className="flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-lg">
                <WifiOff className="h-4 w-4" />
                <span>{t("status.offlineMode", "Offline Mode")}</span>
                <CloudOff className="h-3 w-3 opacity-70" />
            </div>
        </div>
    );
}
