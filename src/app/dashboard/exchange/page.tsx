"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPlantOptions } from "@/lib/plants";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
    ClaimListingModal,
    CreateListingModal,
    ExchangeFilters,
    ListingCard,
    ListingDetailsModal,
} from "./components";
import { DEFAULT_CREATE_FORM } from "./constants";
import {
    useClaimListing,
    useExchangeListings,
    useSavedListings,
    useUserLocation
} from "./hooks";
import type { CreateListingForm, DealType, DeliveryMethod, Listing, ListingMode, ListingType } from "./types";

export default function ExchangePage() {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const plantOptions = useMemo(() => getPlantOptions(), []);

    // location - where you at
    const {
        userLocation,
        userCountry,
        locationStatus,
        locationError,
        detectLocation,
        isReady: isLocationReady,
    } = useUserLocation();

    // listings - the stuff being traded
    const {
        loading,
        filters,
        setFilter,
        clearFilters,
        refetch,
        filteredListings,
        pagination,
        setPage,
    } = useExchangeListings({ userCountry, userLocation, isLocationReady });

    // saved listings - your bookmarks
    const { isSaved, toggleSave } = useSavedListings();

    // mobile filters visibility - responsive ux
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showClaimModal, setShowClaimModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

    // Claim form state
    const [claimMessage, setClaimMessage] = useState("");
    const [claimTradeOffer, setClaimTradeOffer] = useState("");

    // Link copied toast
    const [linkCopied, setLinkCopied] = useState(false);

    // Create listing form
    const [createForm, setCreateForm] = useState<CreateListingForm>(DEFAULT_CREATE_FORM);

    const updateCreateForm = useCallback(<K extends keyof CreateListingForm>(
        key: K,
        value: CreateListingForm[K]
    ) => {
        setCreateForm(prev => ({ ...prev, [key]: value }));
    }, []);

    const resetCreateForm = useCallback(() => {
        setCreateForm(DEFAULT_CREATE_FORM);
    }, []);

    const addTradeItem = useCallback(() => {
        if (createForm.newTradeItem.trim()) {
            setCreateForm(prev => ({
                ...prev,
                tradeItems: [...prev.tradeItems, prev.newTradeItem.trim()],
                newTradeItem: "",
            }));
        }
    }, [createForm.newTradeItem]);

    const removeTradeItem = useCallback((index: number) => {
        setCreateForm(prev => ({
            ...prev,
            tradeItems: prev.tradeItems.filter((_, i) => i !== index),
        }));
    }, []);

    // Create listing submission
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateSubmit = useCallback(async () => {
        if (!createForm.title.trim()) return;

        setIsCreating(true);
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
                    deliveryMethod: createForm.deliveryMethod,
                    latitude: userLocation?.latitude,
                    longitude: userLocation?.longitude,
                    country: userCountry,
                    locationLabel: userLocation
                        ? `${userLocation.latitude.toFixed(2)}, ${userLocation.longitude.toFixed(2)}`
                        : undefined,
                }),
            });

            if (response.ok) {
                setShowCreateModal(false);
                resetCreateForm();
                refetch();
            }
        } catch (err) {
            console.error("Create error:", err);
        } finally {
            setIsCreating(false);
        }
    }, [createForm, userCountry, userLocation, resetCreateForm, refetch]);

    // Claim listing
    const { claimListing, isClaiming } = useClaimListing({
        onSuccess: () => {
            setShowClaimModal(false);
            setSelectedListing(null);
            setClaimMessage("");
            setClaimTradeOffer("");
            refetch();
        },
    });

    const handleClaimSubmit = useCallback(() => {
        if (!selectedListing) return;
        claimListing(
            selectedListing.id,
            claimMessage,
            selectedListing.dealType === "trade" ? claimTradeOffer : undefined
        );
    }, [selectedListing, claimMessage, claimTradeOffer, claimListing]);

    // Open listing from URL
    useEffect(() => {
        const listingId = searchParams.get("listing");
        if (listingId && filteredListings.length > 0) {
            const listing = filteredListings.find(l => l.id === listingId);
            if (listing) {
                setSelectedListing(listing);
                setShowDetailsModal(true);
            }
        }
    }, [searchParams, filteredListings]);

    // Handle URL params to pre-fill create form
    useEffect(() => {
        const typeParam = searchParams.get("type");
        const modeParam = searchParams.get("mode");
        const titleParam = searchParams.get("title");

        if (typeParam || modeParam || titleParam) {
            setCreateForm(prev => ({
                ...prev,
                type: (typeParam as ListingType) || prev.type,
                mode: (modeParam as ListingMode) || prev.mode,
                title: titleParam || prev.title,
                description: searchParams.get("description") || prev.description,
                quantity: searchParams.get("quantity") || prev.quantity,
                dealType: (searchParams.get("dealType") as DealType) || prev.dealType,
                deliveryMethod: (searchParams.get("delivery") as DeliveryMethod) || prev.deliveryMethod,
            }));
            setShowCreateModal(true);
            router.replace("/dashboard/exchange", { scroll: false });
        }
    }, [searchParams, router]);

    // Share listing
    const shareListing = useCallback(async (listingId: string) => {
        const url = `${window.location.origin}/dashboard/exchange?listing=${listingId}`;
        try {
            await navigator.clipboard.writeText(url);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        } catch {
            // Fallback
            const input = document.createElement("input");
            input.value = url;
            document.body.appendChild(input);
            input.select();
            document.execCommand("copy");
            document.body.removeChild(input);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        }
    }, []);

    // Modal handlers
    const openDetails = useCallback((listing: Listing) => {
        setSelectedListing(listing);
        setShowDetailsModal(true);
        window.history.pushState({}, "", `/dashboard/exchange?listing=${listing.id}`);
    }, []);

    const closeDetails = useCallback(() => {
        setShowDetailsModal(false);
        setSelectedListing(null);
        window.history.pushState({}, "", "/dashboard/exchange");
    }, []);

    const openClaim = useCallback((listing: Listing) => {
        setSelectedListing(listing);
        setShowClaimModal(true);
    }, []);

    const openClaimFromDetails = useCallback(() => {
        setShowDetailsModal(false);
        setShowClaimModal(true);
    }, []);

    return (
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 min-h-[calc(100vh-8rem)]">
            {/* Mobile Filter Toggle */}
            <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="lg:hidden flex items-center justify-between w-full px-4 py-3 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]"
            >
                <span className="text-sm font-medium text-[var(--color-text-primary)]">Filters</span>
                <div className="flex items-center gap-2">
                    {(filters.type || filters.status || filters.mode || filters.delivery) && (
                        <span className="text-xs text-[var(--color-primary)]">Active</span>
                    )}
                    <svg
                        className={`w-4 h-4 transition-transform ${showMobileFilters ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {/* Filters Sidebar */}
            <div className={`${showMobileFilters ? "block" : "hidden"} lg:block w-full lg:w-72 flex-shrink-0`}>
                <ExchangeFilters
                    filters={filters}
                    setFilter={setFilter}
                    clearFilters={clearFilters}
                    onApply={refetch}
                    userCountry={userCountry}
                    userLocation={userLocation}
                    locationError={locationError}
                    locationStatus={locationStatus}
                    onDetectLocation={detectLocation}
                    t={t}
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                            {t("exchange.title")}
                        </h1>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                            {t("exchange.subtitle")}
                        </p>
                    </div>
                    <Button onClick={() => setShowCreateModal(true)}>
            + {t("exchange.listing.createButton")}
                    </Button>
                </div>

                {/* Search Bar */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
                    <input
                        type="text"
                        placeholder="Search for a listing..."
                        value={filters.searchQuery}
                        onChange={(e) => setFilter("searchQuery", e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                    />
                    {filters.searchQuery && (
                        <button
                            type="button"
                            onClick={() => setFilter("searchQuery", "")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                        >
              ×
                        </button>
                    )}
                </div>

                {/* Listings */}
                {loading ? (
                    <div className="text-center py-12 text-[var(--color-text-secondary)]">
                        {t("common.loading")}
                    </div>
                ) : filteredListings.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-[var(--color-text-secondary)]">
                                {filters.searchQuery
                                    ? "No listings match your search"
                                    : t("exchange.listing.noListings")}
                            </p>
                            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                                {filters.searchQuery
                                    ? "Try different keywords or clear the search"
                                    : t("exchange.listing.noListingsDescription")}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredListings.map((listing) => (
                                <ListingCard
                                    key={listing.id}
                                    listing={listing}
                                    userCountry={userCountry}
                                    userLocation={userLocation}
                                    isSaved={isSaved(listing.id)}
                                    onToggleSave={() => toggleSave(listing.id)}
                                    onShare={() => shareListing(listing.id)}
                                    onViewDetails={() => openDetails(listing)}
                                    onClaim={() => openClaim(listing)}
                                    t={t}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-8">
                                <button
                                    onClick={() => setPage(pagination.page - 1)}
                                    disabled={pagination.page <= 1}
                                    className="px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-border)] transition-colors"
                                >
                  ← Previous
                                </button>
                
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                        .filter(page => {
                                            // Show first, last, current, and adjacent pages
                                            if (page === 1 || page === pagination.totalPages) return true;
                                            if (Math.abs(page - pagination.page) <= 1) return true;
                                            return false;
                                        })
                                        .map((page, index, arr) => {
                                            // Add ellipsis if there's a gap
                                            const showEllipsisBefore = index > 0 && page - arr[index - 1] > 1;
                                            return (
                                                <span key={page} className="flex items-center gap-1">
                                                    {showEllipsisBefore && (
                                                        <span className="px-2 text-[var(--color-text-secondary)]">...</span>
                                                    )}
                                                    <button
                                                        onClick={() => setPage(page)}
                                                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                                                            page === pagination.page
                                                                ? "bg-[var(--color-primary)] text-white"
                                                                : "border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-border)]"
                                                        }`}
                                                    >
                                                        {page}
                                                    </button>
                                                </span>
                                            );
                                        })}
                                </div>

                                <button
                                    onClick={() => setPage(pagination.page + 1)}
                                    disabled={!pagination.hasMore}
                                    className="px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-border)] transition-colors"
                                >
                  Next →
                                </button>
                            </div>
                        )}

                        {/* Results count */}
                        <p className="text-center text-sm text-[var(--color-text-secondary)] mt-4">
              Showing {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} listings
                        </p>
                    </>
                )}

                {/* Link copied toast */}
                {linkCopied && (
                    <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            Link copied to clipboard!
                    </div>
                )}
            </div>

            {/* Modals */}
            <CreateListingModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                form={createForm}
                updateForm={updateCreateForm}
                onSubmit={handleCreateSubmit}
                isSubmitting={isCreating}
                addTradeItem={addTradeItem}
                removeTradeItem={removeTradeItem}
                userCountry={userCountry}
                userLocation={userLocation}
                locationStatus={locationStatus}
                onDetectLocation={detectLocation}
                plantOptions={plantOptions}
                t={t}
            />

            <ClaimListingModal
                isOpen={showClaimModal}
                onClose={() => {
                    setShowClaimModal(false);
                    setSelectedListing(null);
                    setClaimMessage("");
                    setClaimTradeOffer("");
                }}
                listing={selectedListing}
                message={claimMessage}
                onMessageChange={setClaimMessage}
                tradeOffer={claimTradeOffer}
                onTradeOfferChange={setClaimTradeOffer}
                onSubmit={handleClaimSubmit}
                isSubmitting={isClaiming}
                t={t}
            />

            <ListingDetailsModal
                isOpen={showDetailsModal}
                onClose={closeDetails}
                listing={selectedListing}
                userCountry={userCountry}
                userLocation={userLocation}
                isSaved={selectedListing ? isSaved(selectedListing.id) : false}
                onToggleSave={() => selectedListing && toggleSave(selectedListing.id)}
                onShare={() => selectedListing && shareListing(selectedListing.id)}
                onClaim={openClaimFromDetails}
                t={t}
            />
        </div>
    );
}
