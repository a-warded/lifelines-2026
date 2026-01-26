"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { GeoLocation } from "@/lib/geo";
import { getCountryName } from "@/lib/geo";
import { DELIVERY_METHODS } from "../constants";
import type { CreateListingForm, DealType, DeliveryMethod, ListingType, TranslateFunction } from "../types";

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: CreateListingForm;
  updateForm: <K extends keyof CreateListingForm>(key: K, value: CreateListingForm[K]) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  addTradeItem: () => void;
  removeTradeItem: (index: number) => void;
  userCountry: string;
  userLocation: GeoLocation | null;
  locationStatus: "idle" | "loading" | "detecting" | "success" | "error";
  onDetectLocation: () => void;
  plantOptions: { value: string; label: string }[];
  t: TranslateFunction;
}

export function CreateListingModal({
    isOpen,
    onClose,
    form,
    updateForm,
    onSubmit,
    isSubmitting,
    addTradeItem,
    removeTradeItem,
    userCountry,
    userLocation,
    locationStatus,
    onDetectLocation,
    plantOptions,
    t,
}: CreateListingModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t("exchange.create.title")}>
            <div className="space-y-4">
                {/* Mode Selection */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        {t("exchange.create.modeLabel")}
                    </label>
                    <div className="flex gap-2">
                        <ModeButton
                            selected={form.mode === "offering"}
                            onClick={() => updateForm("mode", "offering")}
                            label={t("exchange.create.modeOffering")}
                        />
                        <ModeButton
                            selected={form.mode === "seeking"}
                            onClick={() => updateForm("mode", "seeking")}
                            label={t("exchange.create.modeSeeking")}
                        />
                    </div>
                </div>

                {/* Type */}
                <Select
                    label={t("exchange.create.typeLabel")}
                    value={form.type}
                    onChange={(e) => updateForm("type", e.target.value as ListingType)}
                    options={[
                        { value: "seeds", label: t("exchange.types.seeds") },
                        { value: "produce", label: t("exchange.types.produce") },
                        { value: "fertilizer", label: t("exchange.types.fertilizer", "🌱 Fertilizer/Compost") },
                        { value: "tools", label: t("exchange.types.tools") },
                        { value: "other", label: t("exchange.types.other") },
                    ]}
                />

                {/* Plant type (for seeds/produce) */}
                {(form.type === "seeds" || form.type === "produce") && (
                    <Select
                        label={t("exchange.create.plantTypeLabel")}
                        value={form.plantId}
                        onChange={(e) => updateForm("plantId", e.target.value)}
                        options={[
                            { value: "", label: t("exchange.create.plantTypePlaceholder") },
                            ...plantOptions,
                        ]}
                    />
                )}

                {/* Title */}
                <Input
                    label={t("exchange.create.titleLabel")}
                    placeholder={t("exchange.create.titlePlaceholder")}
                    value={form.title}
                    onChange={(e) => updateForm("title", e.target.value)}
                />

                {/* Description */}
                <Textarea
                    label={t("exchange.create.descriptionLabel")}
                    placeholder={t("exchange.create.descriptionPlaceholder")}
                    value={form.description}
                    onChange={(e) => updateForm("description", e.target.value)}
                    rows={3}
                />

                {/* Quantity */}
                <Input
                    label={t("exchange.create.quantityLabel")}
                    placeholder={t("exchange.create.quantityPlaceholder")}
                    value={form.quantity}
                    onChange={(e) => updateForm("quantity", e.target.value)}
                />

                {/* Deal type */}
                <Select
                    label={t("exchange.create.dealTypeLabel")}
                    value={form.dealType}
                    onChange={(e) => updateForm("dealType", e.target.value as DealType)}
                    options={[
                        { value: "donation", label: t("exchange.dealType.donation") },
                        { value: "trade", label: t("exchange.dealType.trade") },
                        { value: "price", label: t("exchange.dealType.price") },
                    ]}
                />

                {/* Price input (for priced listings) */}
                {form.dealType === "price" && (
                    <div>
                        <Input
                            type="number"
                            label={t("exchange.create.priceLabel")}
                            placeholder={t("exchange.create.pricePlaceholder")}
                            value={form.price}
                            onChange={(e) => updateForm("price", e.target.value)}
                            min={0}
                            step={0.01}
                        />
                        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                            {t("exchange.create.currencyNote")} ({getCountryName(userCountry)})
                        </p>
                    </div>
                )}

                {/* Trade items (for trade listings) */}
                {form.dealType === "trade" && (
                    <TradeItemsInput
                        items={form.tradeItems}
                        newItem={form.newTradeItem}
                        onNewItemChange={(value) => updateForm("newTradeItem", value)}
                        onAddItem={addTradeItem}
                        onRemoveItem={removeTradeItem}
                        t={t}
                    />
                )}

                {/* Location */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        {t("exchange.create.locationLabel")}
                    </label>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-[var(--color-text-secondary)]">
                            {getCountryName(userCountry)}
                            {userLocation && " (GPS enabled)"}
                        </span>
                        {!userLocation && (
                            <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={onDetectLocation}
                                disabled={locationStatus === "detecting"}
                            >
                                {t("exchange.create.useMyLocation")}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Delivery Method */}
                <DeliveryMethodSelector
                    value={form.deliveryMethod}
                    onChange={(value) => updateForm("deliveryMethod", value)}
                    t={t}
                />

                {/* Submit */}
                <div className="flex gap-2 pt-4">
                    <Button
                        onClick={onSubmit}
                        disabled={isSubmitting || !form.title.trim()}
                        className="flex-1"
                    >
                        {isSubmitting ? t("common.loading") : t("exchange.create.submitButton")}
                    </Button>
                    <Button variant="ghost" onClick={onClose}>
                        {t("common.cancel")}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

// Helper components
function ModeButton({
    selected,
    onClick,
    label,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
}) {
    return (
        <button
            type="button"
            className={`flex-1 p-3 rounded-lg border text-sm transition-colors ${
                selected
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                    : "border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
            }`}
            onClick={onClick}
        >
            {label}
        </button>
    );
}

function TradeItemsInput({
    items,
    newItem,
    onNewItemChange,
    onAddItem,
    onRemoveItem,
    t,
}: {
  items: string[];
  newItem: string;
  onNewItemChange: (value: string) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  t: TranslateFunction;
}) {
    return (
        <div>
            <label className="block text-sm font-medium mb-1">
                {t("exchange.create.tradeItemsLabel")}
            </label>
            <div className="flex gap-2 mb-2">
                <Input
                    placeholder={t("exchange.create.tradeItemsPlaceholder")}
                    value={newItem}
                    onChange={(e) => onNewItemChange(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            onAddItem();
                        }
                    }}
                />
                <Button type="button" onClick={onAddItem} size="sm">
                    {t("exchange.create.addTradeItem")}
                </Button>
            </div>
            {items.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {items.map((item, i) => (
                        <button
                            key={i}
                            type="button"
                            className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground cursor-pointer hover:bg-secondary/80"
                            onClick={() => onRemoveItem(i)}
                        >
                            {item} ×
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function DeliveryMethodSelector({
    value,
    onChange,
    t,
}: {
  value: DeliveryMethod;
  onChange: (value: DeliveryMethod) => void;
  t: TranslateFunction;
}) {
    return (
        <div>
            <label className="block text-sm font-medium mb-2">
                {t("exchange.create.deliveryLabel", "Delivery Method")}
            </label>
            <div className="grid grid-cols-3 gap-2">
                {DELIVERY_METHODS.map((method) => (
                    <button
                        key={method.value}
                        type="button"
                        onClick={() => onChange(method.value)}
                        className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                            value === method.value
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50"
                        }`}
                    >
                        <span className="text-xs text-center">{method.label}</span>
                    </button>
                ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
                {t("exchange.create.deliveryNote", "Select how you can deliver or receive this item")}
            </p>
        </div>
    );
}
