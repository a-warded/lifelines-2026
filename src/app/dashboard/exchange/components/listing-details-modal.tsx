"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, BookmarkCheck, Link as LinkIcon } from "lucide-react";
import { getCountryName, formatPrice, calculateDistance } from "@/lib/geo";
import type { GeoLocation } from "@/lib/geo";
import type { Listing, TranslateFunction } from "../types";
import { DELIVERY_METHODS, TYPE_COLORS, STATUS_COLORS } from "../constants";

interface ListingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing | null;
  userCountry: string;
  userLocation: GeoLocation | null;
  isSaved: boolean;
  onToggleSave: () => void;
  onShare: () => void;
  onClaim: () => void;
  t: TranslateFunction;
}

export function ListingDetailsModal({
  isOpen,
  onClose,
  listing,
  userCountry,
  userLocation,
  isSaved,
  onToggleSave,
  onShare,
  onClaim,
  t,
}: ListingDetailsModalProps) {
  if (!listing) return null;

  const imageUrl = extractImageUrl(listing.description);
  const distance = getListingDistance(listing, userLocation);
  const deliveryMethod = DELIVERY_METHODS.find(m => m.value === listing.deliveryMethod);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Listing Details" size="lg">
      <div className="space-y-4">
        {/* Image */}
        {imageUrl && (
          <div className="rounded-lg overflow-hidden">
            <img
              src={imageUrl}
              alt={listing.title}
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        {/* Title and badges */}
        <div>
          <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">
            {listing.title}
          </h3>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge className={`text-xs ${STATUS_COLORS[listing.status]}`}>
              {listing.status.toUpperCase()}
            </Badge>
            <Badge className={`text-xs ${TYPE_COLORS[listing.type] || TYPE_COLORS.other}`}>
              {t(`exchange.types.${listing.type}`).toUpperCase()}
            </Badge>
            <DealTypeBadge listing={listing} userCountry={userCountry} t={t} />
          </div>
        </div>

        {/* Description */}
        <div className="p-3 bg-[var(--color-surface)] rounded-lg">
          <p className="text-sm font-medium mb-1">Description</p>
          <p className="text-sm text-[var(--color-text-secondary)] whitespace-pre-wrap">
            {listing.description || "No description provided."}
          </p>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-4">
          {listing.quantity && (
            <DetailItem label="Quantity" value={listing.quantity} />
          )}
          <DetailItem 
            label="Mode" 
            value={listing.mode === "offering" ? "Offering" : "Seeking"} 
          />
          <DetailItem 
            label="Posted by" 
            value={listing.userName || "Anonymous"} 
          />
          <DetailItem 
            label="Location" 
            value={listing.locationLabel || getCountryName(listing.country)} 
          />
          {distance !== null && (
            <DetailItem label="Distance" value={`${distance}km away`} />
          )}
          <DetailItem
            label="Delivery"
            value={
              <span className="flex items-center gap-2">
                <span>{deliveryMethod?.emoji || "📍"}</span>
                {deliveryMethod?.label || "Pick-up at location"}
              </span>
            }
          />
        </div>

        {/* Trade items */}
        {listing.dealType === "trade" && listing.tradeItems && listing.tradeItems.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">
              {listing.mode === "offering" ? "Wants in return:" : "Looking for:"}
            </p>
            <div className="flex flex-wrap gap-1">
              {listing.tradeItems.map((item, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onToggleSave} className="flex items-center gap-2">
            {isSaved ? (
              <>
                <BookmarkCheck className="w-4 h-4" />
                Saved
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4" />
                Save
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onShare} className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            Share
          </Button>
          {!listing.isOwner && listing.status === "available" && (
            <Button onClick={onClaim} className="flex-1">
              {listing.dealType === "trade"
                ? t("exchange.listing.offerTradeButton")
                : t("exchange.listing.claimButton")}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

// Helper components
function DetailItem({ 
  label, 
  value 
}: { 
  label: string; 
  value: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-[var(--color-text-secondary)] uppercase">{label}</p>
      <p className="text-sm font-medium">{value}</p>
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
