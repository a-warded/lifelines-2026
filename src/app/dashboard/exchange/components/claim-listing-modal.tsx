"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Listing, TranslateFunction } from "../types";

interface ClaimListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing | null;
  message: string;
  onMessageChange: (message: string) => void;
  tradeOffer: string;
  onTradeOfferChange: (tradeOffer: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  t: TranslateFunction;
}

export function ClaimListingModal({
  isOpen,
  onClose,
  listing,
  message,
  onMessageChange,
  tradeOffer,
  onTradeOfferChange,
  onSubmit,
  isSubmitting,
  t,
}: ClaimListingModalProps) {
  if (!listing) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("exchange.claim.title")}>
      <div className="space-y-4">
        {/* Listing preview */}
        <div className="p-3 bg-[var(--color-surface)] rounded-lg">
          <p className="font-medium">{listing.title}</p>
          <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2">
            {listing.description}
          </p>
        </div>

        {/* Message */}
        <Textarea
          label={t("exchange.claim.messageLabel")}
          placeholder={t("exchange.claim.messagePlaceholder")}
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          rows={3}
        />

        {/* Trade offer (for trade listings) */}
        {listing.dealType === "trade" && (
          <Textarea
            label={t("exchange.claim.tradeOfferLabel")}
            placeholder={t("exchange.claim.tradeOfferPlaceholder")}
            value={tradeOffer}
            onChange={(e) => onTradeOfferChange(e.target.value)}
            rows={2}
          />
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={onSubmit} disabled={isSubmitting} className="flex-1">
            {isSubmitting ? t("common.loading") : t("exchange.claim.submitButton")}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            {t("common.cancel")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
