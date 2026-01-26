"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { GeoLocation } from "@/lib/geo";
import { calculateDistance, formatPrice } from "@/lib/geo";
import { Bookmark, BookmarkCheck, Link as LinkIcon } from "lucide-react";
import { DELIVERY_METHODS, STATUS_COLORS, TYPE_COLORS } from "../constants";
import type { Listing, TranslateFunction } from "../types";
import { title } from "process";
import { label } from "three/tsl";

interface ListingCardProps {
  listing: Listing;
  userCountry: string;
  userLocation: GeoLocation | null;
  isSaved: boolean;
  onToggleSave: () => void;
  onShare: () => void;
  onViewDetails: () => void;
  onClaim: () => void;
  t: TranslateFunction;
}

export function ListingCard({
    listing,
    userCountry,
    userLocation,
    isSaved,
    onToggleSave,
    onShare,
    onViewDetails,
    onClaim,
    t,
}: ListingCardProps) {
    // Use imageUrl field first, then try to extract from description
    const imageUrl = listing.imageUrl || extractImageUrl(listing.description);
    const distance = getListingDistance(listing, userLocation);
    const deliveryMethod = DELIVERY_METHODS.find(m => m.value === listing.deliveryMethod);

    return (
        <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] overflow-hidden flex flex-col">
            {/* Card Header/Image */}
            <div className="relative h-36 bg-gradient-to-br from-green-800 to-green-950 overflow-hidden">
                {imageUrl && (
                    <img
                        src={imageUrl}
                        alt={listing.title}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                )}
        
                {/* Status overlay for non-available */}
                {listing.status !== "available" && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                        <span className="text-white/80 text-2xl font-bold tracking-widest uppercase">
                            {listing.status}
                        </span>
                    </div>
                )}
        
                {/* Decorative pattern */}
                {!imageUrl && (
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-4 right-4 w-24 h-24 border border-white/20 rounded-full" />
                        <div className="absolute bottom-4 left-4 w-16 h-16 border border-white/20 rounded-full" />
                    </div>
                )}
        
                {/* Bottom badges */}
                <div className="absolute bottom-0 left-0 right-0 px-3 py-2 flex items-center justify-between bg-gradient-to-t from-black/40">
                    <span className="text-white text-xs">
                        {listing.quantity || "Qty N/A"}
                    </span>
                    <Badge className={`text-xs font-medium ${TYPE_COLORS[listing.type] || TYPE_COLORS.other}`}>
                        {t(`exchange.types.${listing.type}`).toUpperCase()}
                    </Badge>
                </div>
        
                {/* Bookmark button */}
                <button
                    onClick={onToggleSave}
                    className="absolute top-3 right-3 p-1.5 rounded bg-white/10 hover:bg-white/20 transition-colors"
                    aria-label={isSaved ? "Remove bookmark" : "Bookmark listing"}
                >
                    {isSaved ? (
                        <BookmarkCheck className="w-4 h-4 text-yellow-400" />
                    ) : (
                        <Bookmark className="w-4 h-4 text-white" />
                    )}
                </button>
            </div>

            {/* Card Content */}
            <div className="p-4 flex-1 flex flex-col">

                {/* Title with actions */}
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-[var(--color-text-primary)] line-clamp-1">
                        {listing.title}
                    </h3>
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                            onClick={onToggleSave}
                            className="p-1 hover:bg-[var(--color-surface)] rounded transition-colors"
                            aria-label={isSaved ? "Remove from saved" : "Save listing"}
                        >
                            {isSaved ? (
                                <BookmarkCheck className="w-4 h-4 text-yellow-500" />
                            ) : (
                                <Bookmark className="w-4 h-4 text-[var(--color-text-secondary)]" />
                            )}
                        </button>
                        <button
                            onClick={onShare}
                            className="p-1 hover:bg-[var(--color-surface)] rounded transition-colors"
                            aria-label="Copy link"
                        >
                            <LinkIcon className="w-4 h-4 text-[var(--color-text-secondary)]" />
                        </button>
                    </div>
                </div>

                {/* Status & Deal Type Badges */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <Badge className={`text-xs ${STATUS_COLORS[listing.status]}`}>
                        {listing.status.toUpperCase()}
                    </Badge>
                    <DealTypeBadge listing={listing} userCountry={userCountry} t={t} />
                </div>

                {/* User */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-xs text-white font-medium">
                        {(listing.userName || "U")[0].toUpperCase()}
                    </div>
                    <span className="text-sm text-[var(--color-primary)] font-medium truncate">
                        {listing.userName || "Anonymous"}
                    </span>
                </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 py-3 border-t border-[var(--color-border)]">
          <StatItem label={t("exchange.listing.claims")} value={listing.claimCount || 0} />
          <StatItem 
            label={t("exchange.listing.distance", { distance: "" }).split(" ")[0] || "Distance"} 
            value={formatDistance(distance)} 
          />
          <StatItem 
            label={t("exchange.listing.delivery")} 
            value={deliveryMethod?.emoji || "📍"} 
            title={t(`exchange.create.deliveryMethods.${listing.deliveryMethod}`, deliveryMethod?.label || "Pick-up")} 
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-auto pt-3">
          <Button variant="outline" size="sm" className="w-full text-xs" onClick={onViewDetails}>
            {t("exchange.listing.viewDetails")}
          </Button>
          {!listing.isOwner && listing.status === "available" ? (
            <Button size="sm" className="w-full text-xs" onClick={onClaim}>
              {listing.dealType === "trade" 
                ? t("exchange.listing.offerTradeButton") 
                : t("exchange.listing.claimButton")}
            </Button>
          ) : (
            <Button size="sm" variant="secondary" className="w-full text-xs" onClick={onViewDetails}>
              {t("exchange.listing.viewStatus")}
            </Button>
          )}
        </div>
    );
}

// Helper components
function StatItem({ 
    label, 
    value, 
    title 
}: { 
  label: string; 
  value: string | number; 
  title?: string;
}) {
    return (
        <div className="text-center">
            <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide">
                {label}
            </p>
            <p 
                className="text-lg font-semibold text-[var(--color-text-primary)]" 
                title={title}
            >
                {value}
            </p>
        </div>
    );
}

function DealTypeBadge({ 
    listing, 
    userCountry,
    t,
}: { 
  listing: Listing; 
  userCountry: string;
  t: TranslateFunction;
}) {
    switch (listing.dealType) {
    case "price":
        return (
            <Badge className="bg-blue-100 text-blue-800">
                {formatPrice(listing.price || 0, listing.currencyCountry || userCountry)}
            </Badge>
        );
    case "trade":
        return (
            <Badge className="bg-purple-100 text-purple-800">
                {t("exchange.dealType.trade")}
            </Badge>
        );
    case "donation":
        return (
            <Badge className="bg-green-100 text-green-800">
                {t("exchange.dealType.donation")}
            </Badge>
        );
    default:
        return null;
    }
}

// Utility functions
function extractImageUrl(text: string): string | null {
    if (!text) return null;
    const imgUrlRegex = /(https?:\/\/\S+\.(?:png|jpg|jpeg|gif|webp|svg)(?:\?\S*)?)/gi;
    const match = imgUrlRegex.exec(text);
    return match ? match[0] : null;
}

function formatDistance(distance: number | null): string {
    if (distance === null || distance === undefined) return "—";
    if (distance < 1) return "<1km";
    if (distance >= 1000) return `${Math.round(distance / 100) / 10}k km`;
    return `${Math.round(distance)}km`;
}

function getListingDistance(listing: Listing, userLocation: GeoLocation | null): number | null {
    if (listing.distance !== undefined) {
        return listing.distance;
    }

    if (
        userLocation?.latitude && 
    userLocation?.longitude && 
    listing.latitude && 
    listing.longitude
    ) {
        const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            listing.latitude,
            listing.longitude
        );
        return Math.round(distance * 10) / 10;
    }

    return null;
}
