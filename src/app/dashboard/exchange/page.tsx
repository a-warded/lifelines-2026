"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
    formatPrice,
    GeoLocation,
    getCountryFromCoords,
    getCountryName,
    getUserLocation,
} from "@/lib/geo";
import { getPlantOptions } from "@/lib/plants";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

interface Listing {
    id: string;
    userId: string;
    userName?: string;
    type: string;
    plantId?: string;
    title: string;
    description: string;
    quantity?: string;
    mode: "offering" | "seeking";
    dealType: "price" | "trade" | "donation";
    price?: number;
    currencyCountry?: string;
    tradeItems?: string[];
    country: string;
    locationLabel?: string;
    distance?: number;
    status: string;
    createdAt: string;
    isOwner: boolean;
}

type ListingType = "seeds" | "produce" | "tools" | "other";
type ListingMode = "offering" | "seeking";
type DealType = "price" | "trade" | "donation";

export default function ExchangePage() {
    const { t } = useTranslation();
    const plantOptions = useMemo(() => getPlantOptions(), []);

    // Location state
    const [userLocation, setUserLocation] = useState<GeoLocation | null>(null);
    const [userCountry, setUserCountry] = useState<string>("");
    const [locationStatus, setLocationStatus] = useState<"idle" | "detecting" | "success" | "error">("idle");
    const [locationError, setLocationError] = useState<string>("");

    // Listings state
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Filters
    const [filterType, setFilterType] = useState<string>("");
    const [filterStatus, setFilterStatus] = useState<string>("available");
    const [filterMode, setFilterMode] = useState<string>("");

    // Create modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState({
        mode: "offering" as ListingMode,
        type: "seeds" as ListingType,
        plantId: "",
        title: "",
        description: "",
        quantity: "",
        dealType: "donation" as DealType,
        price: "",
        tradeItems: [] as string[],
        newTradeItem: "",
    });
    const [creating, setCreating] = useState(false);

    // Claim modal state
    const [showClaimModal, setShowClaimModal] = useState(false);
    const [claimListing, setClaimListing] = useState<Listing | null>(null);
    const [claimMessage, setClaimMessage] = useState("");
    const [claimTradeOffer, setClaimTradeOffer] = useState("");
    const [claiming, setClaiming] = useState(false);

    // Get user's country on mount
    useEffect(() => {
        fetchUserCountry();
    }, []);

    // Fetch listings when location is available
    useEffect(() => {
        if (userCountry) {
            fetchListings();
        }
    }, [userCountry, filterType, filterStatus, filterMode]);

    const fetchUserCountry = async () => {
        try {
            // First try to get from API (Cloudflare header)
            const response = await fetch("/api/geo");
            const data = await response.json();
            setUserCountry(data.country);
        } catch {
            setUserCountry("US"); // Fallback
        }
    };

    const detectLocation = async () => {
        setLocationStatus("detecting");
        setLocationError("");

        try {
            const location = await getUserLocation();
            const country = await getCountryFromCoords(location.latitude, location.longitude);
            
            setUserLocation({
                ...location,
                country,
            });
            setUserCountry(country);
            setLocationStatus("success");
            
            // Refetch listings with new location
            fetchListings();
        } catch (err) {
            setLocationStatus("error");
            setLocationError(err instanceof Error ? err.message : "Location error");
            // Keep using country from IP
        }
    };

    const fetchListings = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterType) params.set("type", filterType);
            if (filterStatus) params.set("status", filterStatus);
            if (filterMode) params.set("mode", filterMode);
            if (userCountry) params.set("country", userCountry);

            const response = await fetch(`/api/exchange?${params}`);
            const data = await response.json();

            if (data.listings) {
                setListings(data.listings);
            }
        } catch (err) {
            setError("Failed to load listings");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateListing = async () => {
        if (!createForm.title.trim()) return;

        setCreating(true);
        try {
            const response = await fetch("/api/exchange", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mode: createForm.mode,
                    type: createForm.type,
                    plantId: createForm.plantId || undefined,
                    title: createForm.title,
                    description: createForm.description,
                    quantity: createForm.quantity,
                    dealType: createForm.dealType,
                    price: createForm.dealType === "price" ? parseFloat(createForm.price) : undefined,
                    tradeItems: createForm.dealType === "trade" ? createForm.tradeItems : undefined,
                    latitude: userLocation?.latitude,
                    longitude: userLocation?.longitude,
                    country: userCountry,
                    locationLabel: userLocation ? `${userLocation.latitude.toFixed(2)}, ${userLocation.longitude.toFixed(2)}` : undefined,
                }),
            });

            if (response.ok) {
                setShowCreateModal(false);
                resetCreateForm();
                fetchListings();
            }
        } catch (err) {
            console.error("Create error:", err);
        } finally {
            setCreating(false);
        }
    };

    const resetCreateForm = () => {
        setCreateForm({
            mode: "offering",
            type: "seeds",
            plantId: "",
            title: "",
            description: "",
            quantity: "",
            dealType: "donation",
            price: "",
            tradeItems: [],
            newTradeItem: "",
        });
    };

    const addTradeItem = () => {
        if (createForm.newTradeItem.trim()) {
            setCreateForm({
                ...createForm,
                tradeItems: [...createForm.tradeItems, createForm.newTradeItem.trim()],
                newTradeItem: "",
            });
        }
    };

    const removeTradeItem = (index: number) => {
        setCreateForm({
            ...createForm,
            tradeItems: createForm.tradeItems.filter((_, i) => i !== index),
        });
    };

    const handleClaim = async () => {
        if (!claimListing) return;

        setClaiming(true);
        try {
            const response = await fetch("/api/exchange/claim", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    listingId: claimListing.id,
                    message: claimMessage,
                    tradeOffer: claimListing.dealType === "trade" ? claimTradeOffer : undefined,
                }),
            });

            if (response.ok) {
                setShowClaimModal(false);
                setClaimListing(null);
                setClaimMessage("");
                setClaimTradeOffer("");
                fetchListings();
            }
        } catch (err) {
            console.error("Claim error:", err);
        } finally {
            setClaiming(false);
        }
    };

    const getDealTypeBadge = (listing: Listing) => {
        switch (listing.dealType) {
        case "price":
            return (
                <Badge className="bg-blue-100 text-blue-800">
                    {formatPrice(listing.price || 0, listing.currencyCountry || userCountry)}
                </Badge>
            );
        case "trade":
            return <Badge className="bg-purple-100 text-purple-800">{t("exchange.dealType.trade")}</Badge>;
        case "donation":
            return <Badge className="bg-green-100 text-green-800">{t("exchange.dealType.donation")}</Badge>;
        }
    };

    const getModeBadge = (mode: string) => {
        return mode === "seeking" ? (
            <Badge className="bg-orange-100 text-orange-800">{t("exchange.mode.seeking")}</Badge>
        ) : (
            <Badge className="bg-teal-100 text-teal-800">{t("exchange.mode.offering")}</Badge>
        );
    };

    // Add helper to render description text and inline images for image URLs
    const renderDescription = (text: string) => {
        if (!text) return null;
        // matches http(s) urls ending with common image extensions (allows query params)
        const imgUrlRegex = /(https?:\/\/\S+\.(?:png|jpg|jpeg|gif|webp|svg)(?:\?\S*)?)/gi;
        const parts: (string | { img: string })[] = [];
        let lastIndex = 0;
        let match: RegExpExecArray | null;
        while ((match = imgUrlRegex.exec(text)) !== null) {
            const url = match[0];
            const idx = match.index;
            if (idx > lastIndex) {
                parts.push(text.slice(lastIndex, idx));
            }
            parts.push({ img: url });
            lastIndex = idx + url.length;
        }
        if (lastIndex < text.length) {
            parts.push(text.slice(lastIndex));
        }

        return (
            <div>
                {parts.map((part, i) =>
                    typeof part === "string" ? (
                        <span key={i} className="text-[var(--color-text-secondary)]">{part}</span>
                    ) : (
                        <div key={i} className="mt-2">
                            <img
                                src={part.img}
                                alt="listing image"
                                className="rounded max-w-full h-auto border"
                            />
                        </div>
                    )
                )}
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                        {t("exchange.title")}
                    </h1>
                    <p className="text-[var(--color-text-secondary)] mt-1">
                        {t("exchange.subtitle")}
                    </p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    + {t("exchange.listing.createButton")}
                </Button>
            </div>

            {/* Location bar */}
            <Card>
                <CardContent className="py-3">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm">📍</span>
                            {locationStatus === "success" ? (
                                <span className="text-sm text-green-600">
                                    {t("exchange.location.usingCountry", { country: getCountryName(userCountry) })}
                                    {userLocation && ` (GPS: ${userLocation.latitude.toFixed(2)}, ${userLocation.longitude.toFixed(2)})`}
                                </span>
                            ) : locationStatus === "error" ? (
                                <span className="text-sm text-orange-600">
                                    {t("exchange.location.noPermission")} {getCountryName(userCountry)}
                                </span>
                            ) : (
                                <span className="text-sm text-[var(--color-text-secondary)]">
                                    {t("exchange.location.usingCountry", { country: getCountryName(userCountry) })}
                                </span>
                            )}
                        </div>
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={detectLocation}
                            disabled={locationStatus === "detecting"}
                        >
                            {locationStatus === "detecting"
                                ? t("exchange.create.locationDetecting")
                                : t("exchange.create.useMyLocation")}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    options={[
                        { value: "", label: t("exchange.filters.allTypes") },
                        { value: "seeds", label: t("exchange.types.seeds") },
                        { value: "produce", label: t("exchange.types.produce") },
                        { value: "tools", label: t("exchange.types.tools") },
                        { value: "other", label: t("exchange.types.other") },
                    ]}
                    className="w-36"
                />
                <Select
                    value={filterMode}
                    onChange={(e) => setFilterMode(e.target.value)}
                    options={[
                        { value: "", label: t("exchange.filters.allModes") },
                        { value: "offering", label: t("exchange.mode.offering") },
                        { value: "seeking", label: t("exchange.mode.seeking") },
                    ]}
                    className="w-40"
                />
                <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    options={[
                        { value: "available", label: t("exchange.status.available") },
                        { value: "", label: t("exchange.filters.allStatuses") },
                        { value: "claimed", label: t("exchange.status.claimed") },
                        { value: "completed", label: t("exchange.status.completed") },
                    ]}
                    className="w-36"
                />
            </div>

            {/* Listings */}
            {loading ? (
                <div className="text-center py-12 text-[var(--color-text-secondary)]">
                    {t("common.loading")}
                </div>
            ) : listings.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-[var(--color-text-secondary)]">
                            {t("exchange.listing.noListings")}
                        </p>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                            {t("exchange.listing.noListingsDescription")}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {listings.map((listing) => (
                        <Card key={listing.id}>
                            <CardContent className="py-4">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap mb-2">
                                            {getModeBadge(listing.mode)}
                                            <Badge variant="secondary">
                                                {t(`exchange.types.${listing.type}`)}
                                            </Badge>
                                            {getDealTypeBadge(listing)}
                                            {listing.distance !== undefined && (
                                                <span className="text-xs text-[var(--color-text-secondary)]">
                                                    {t("exchange.listing.distance", { distance: listing.distance })}
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="font-semibold text-lg">{listing.title}</h3>
                                        
                                        {listing.quantity && (
                                            <p className="text-sm text-[var(--color-text-secondary)]">
                                                {listing.quantity}
                                            </p>
                                        )}
                                        
                                        <span className="text-[var(--color-text-secondary)] mt-1 line-clamp-2">
                                            {renderDescription(listing.description)}
                                        </span>

                                        {/* Trade items wanted */}
                                        {listing.dealType === "trade" && listing.tradeItems && listing.tradeItems.length > 0 && (
                                            <div className="mt-2">
                                                <span className="text-sm font-medium">
                                                    {listing.mode === "offering" 
                                                        ? t("exchange.listing.wantsInReturn")
                                                        : t("exchange.listing.lookingFor")}:
                                                </span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {listing.tradeItems.map((item, i) => (
                                                        <Badge key={i} variant="secondary" className="text-xs">
                                                            {item}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-3 mt-3 text-sm text-[var(--color-text-secondary)]">
                                            {listing.userName && (
                                                <span>👤 {listing.userName}</span>
                                            )}
                                            <span>📍 {getCountryName(listing.country)}</span>
                                        </div>
                                    </div>

                                    {!listing.isOwner && listing.status === "available" && (
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                setClaimListing(listing);
                                                setShowClaimModal(true);
                                            }}
                                        >
                                            {listing.dealType === "trade"
                                                ? t("exchange.listing.offerTradeButton")
                                                : t("exchange.listing.claimButton")}
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title={t("exchange.create.title")}
            >
                <div className="space-y-4">
                    {/* Mode */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            {t("exchange.create.modeLabel")}
                        </label>
                        <div className="flex gap-2">
                            <button
                                className={`flex-1 p-3 rounded-lg border text-sm ${
                                    createForm.mode === "offering"
                                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                                        : "border-[var(--color-border)]"
                                }`}
                                onClick={() => setCreateForm({ ...createForm, mode: "offering" })}
                            >
                                {t("exchange.create.modeOffering")}
                            </button>
                            <button
                                className={`flex-1 p-3 rounded-lg border text-sm ${
                                    createForm.mode === "seeking"
                                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                                        : "border-[var(--color-border)]"
                                }`}
                                onClick={() => setCreateForm({ ...createForm, mode: "seeking" })}
                            >
                                {t("exchange.create.modeSeeking")}
                            </button>
                        </div>
                    </div>

                    {/* Type */}
                    <Select
                        label={t("exchange.create.typeLabel")}
                        value={createForm.type}
                        onChange={(e) => setCreateForm({ ...createForm, type: e.target.value as ListingType })}
                        options={[
                            { value: "seeds", label: t("exchange.types.seeds") },
                            { value: "produce", label: t("exchange.types.produce") },
                            { value: "tools", label: t("exchange.types.tools") },
                            { value: "other", label: t("exchange.types.other") },
                        ]}
                    />

                    {/* Plant type (for seeds/produce) */}
                    {(createForm.type === "seeds" || createForm.type === "produce") && (
                        <Select
                            label={t("exchange.create.plantTypeLabel")}
                            value={createForm.plantId}
                            onChange={(e) => setCreateForm({ ...createForm, plantId: e.target.value })}
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
                        value={createForm.title}
                        onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                    />

                    {/* Description */}
                    <Textarea
                        label={t("exchange.create.descriptionLabel")}
                        placeholder={t("exchange.create.descriptionPlaceholder")}
                        value={createForm.description}
                        onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                        rows={3}
                    />

                    {/* Quantity */}
                    <Input
                        label={t("exchange.create.quantityLabel")}
                        placeholder={t("exchange.create.quantityPlaceholder")}
                        value={createForm.quantity}
                        onChange={(e) => setCreateForm({ ...createForm, quantity: e.target.value })}
                    />

                    {/* Deal type */}
                    <Select
                        label={t("exchange.create.dealTypeLabel")}
                        value={createForm.dealType}
                        onChange={(e) => setCreateForm({ ...createForm, dealType: e.target.value as DealType })}
                        options={[
                            { value: "donation", label: t("exchange.dealType.donation") },
                            { value: "trade", label: t("exchange.dealType.trade") },
                            { value: "price", label: t("exchange.dealType.price") },
                        ]}
                    />

                    {/* Price input */}
                    {createForm.dealType === "price" && (
                        <div>
                            <Input
                                type="number"
                                label={t("exchange.create.priceLabel")}
                                placeholder={t("exchange.create.pricePlaceholder")}
                                value={createForm.price}
                                onChange={(e) => setCreateForm({ ...createForm, price: e.target.value })}
                                min={0}
                                step={0.01}
                            />
                            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                                {t("exchange.create.currencyNote")} ({getCountryName(userCountry)})
                            </p>
                        </div>
                    )}

                    {/* Trade items */}
                    {createForm.dealType === "trade" && (
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                {t("exchange.create.tradeItemsLabel")}
                            </label>
                            <div className="flex gap-2 mb-2">
                                <Input
                                    placeholder={t("exchange.create.tradeItemsPlaceholder")}
                                    value={createForm.newTradeItem}
                                    onChange={(e) => setCreateForm({ ...createForm, newTradeItem: e.target.value })}
                                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTradeItem())}
                                />
                                <Button type="button" onClick={addTradeItem} size="sm">
                                    {t("exchange.create.addTradeItem")}
                                </Button>
                            </div>
                            {createForm.tradeItems.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {createForm.tradeItems.map((item, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground cursor-pointer hover:bg-secondary/80"
                                            onClick={() => removeTradeItem(i)}
                                        >
                                            {item} ×
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            {t("exchange.create.locationLabel")}
                        </label>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-[var(--color-text-secondary)]">
                                📍 {getCountryName(userCountry)}
                                {userLocation && ` (GPS enabled)`}
                            </span>
                            {!userLocation && (
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="secondary"
                                    onClick={detectLocation}
                                    disabled={locationStatus === "detecting"}
                                >
                                    {t("exchange.create.useMyLocation")}
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-2 pt-4">
                        <Button
                            onClick={handleCreateListing}
                            disabled={creating || !createForm.title.trim()}
                            className="flex-1"
                        >
                            {creating ? t("common.loading") : t("exchange.create.submitButton")}
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setShowCreateModal(false)}
                        >
                            {t("common.cancel")}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Claim Modal */}
            <Modal
                isOpen={showClaimModal}
                onClose={() => setShowClaimModal(false)}
                title={t("exchange.claim.title")}
            >
                {claimListing && (
                    <div className="space-y-4">
                        <div className="p-3 bg-[var(--color-surface)] rounded-lg">
                            <p className="font-medium">{claimListing.title}</p>
                            <div className="text-sm text-[var(--color-text-secondary)]">
                                {renderDescription(claimListing.description)}
                            </div>
                        </div>

                        <Textarea
                            label={t("exchange.claim.messageLabel")}
                            placeholder={t("exchange.claim.messagePlaceholder")}
                            value={claimMessage}
                            onChange={(e) => setClaimMessage(e.target.value)}
                            rows={3}
                        />

                        {claimListing.dealType === "trade" && (
                            <Textarea
                                label={t("exchange.claim.tradeOfferLabel")}
                                placeholder={t("exchange.claim.tradeOfferPlaceholder")}
                                value={claimTradeOffer}
                                onChange={(e) => setClaimTradeOffer(e.target.value)}
                                rows={2}
                            />
                        )}

                        <div className="flex gap-2">
                            <Button
                                onClick={handleClaim}
                                disabled={claiming}
                                className="flex-1"
                            >
                                {claiming ? t("common.loading") : t("exchange.claim.submitButton")}
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setShowClaimModal(false)}
                            >
                                {t("common.cancel")}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
