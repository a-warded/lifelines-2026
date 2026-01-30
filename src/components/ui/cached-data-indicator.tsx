"use client";

import { CloudOff, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CachedDataIndicatorProps {
    isCached: boolean;
    cachedAt?: number;
    onRefresh?: () => void;
    isRefreshing?: boolean;
    className?: string;
}

export function CachedDataIndicator({
    isCached,
    cachedAt,
    onRefresh,
    isRefreshing = false,
    className = "",
}: CachedDataIndicatorProps) {
    const { t } = useTranslation();

    if (!isCached) return null;

    const getCachedTimeAgo = () => {
        if (!cachedAt) return "";
        
        const now = Date.now();
        const diff = now - cachedAt;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ago`;
        }
        if (minutes > 0) {
            return `${minutes}m ago`;
        }
        return "just now";
    };

    return (
        <div 
            className={`inline-flex items-center gap-2 rounded-full bg-amber-100 dark:bg-amber-900/30 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-300 ${className}`}
        >
            <CloudOff className="h-3 w-3" />
            <span>
                {t("status.cachedData", "Showing cached data")}
                {cachedAt && ` · ${getCachedTimeAgo()}`}
            </span>
            {onRefresh && (
                <button
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    className="ml-1 rounded p-0.5 hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors disabled:opacity-50"
                    title={t("common.refresh", "Refresh")}
                >
                    <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
                </button>
            )}
        </div>
    );
}
