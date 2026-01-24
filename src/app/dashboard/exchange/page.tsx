"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
    calculateDistance,
    formatPrice,
    GeoLocation,
    getCountryFromCoords,
    getCountryName,
    getLocationLabel,
    getUserLocation,
} from "@/lib/geo";
import { getPlantOptions } from "@/lib/plants";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Bookmark, Share2, X, RotateCcw, Check, BookmarkCheck, Link as LinkIcon } from "lucide-react";

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
    deliveryMethod?: string;
    country: string;
    latitude?: number;
    longitude?: number;
    locationLabel?: string;
    distance?: number;
    status: string;
    createdAt: string;
    isOwner: boolean;
    claimCount?: number;
}

type ListingType = "seeds" | "produce" | "tools" | "fertilizer" | "other";
type ListingMode = "offering" | "seeking";
type DealType = "price" | "trade" | "donation";
type DeliveryMethod = "pickup" | "walking" | "bicycle" | "car" | "truck" | "boat" | "drone" | "helicopter" | "airdrop";

const DELIVERY_METHODS: { value: DeliveryMethod; label: string; emoji: string }[] = [
    { value: "pickup", label: "Pick-up at location", emoji: "📍" },
    { value: "walking", label: "Walking delivery", emoji: "🚶" },
    { value: "bicycle", label: "Bicycle delivery", emoji: "🚲" },
    { value: "car", label: "Car delivery", emoji: "🚗" },
    { value: "truck", label: "Truck delivery", emoji: "🚚" },
    { value: "boat", label: "Boat/Water transport", emoji: "🚤" },
    { value: "drone", label: "Drone delivery", emoji: "🛸" },
    { value: "helicopter", label: "Helicopter/Care package", emoji: "🚁" },
    { value: "airdrop", label: "Emergency airdrop", emoji: "🪂" },
];

export default function ExchangePage() {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
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
    const [filterStatus, setFilterStatus] = useState<string>("");
    const [filterMode, setFilterMode] = useState<string>("");
    const [filterDelivery, setFilterDelivery] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Saved/bookmarked listings
    const [savedListings, setSavedListings] = useState<Set<string>>(new Set());

    // View details modal state (separate from claim)
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [detailsListing, setDetailsListing] = useState<Listing | null>(null);

    // Link copied toast
    const [linkCopied, setLinkCopied] = useState(false);

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
        deliveryMethod: "pickup" as DeliveryMethod,
    });
    const [creating, setCreating] = useState(false);

    // Claim modal state
    const [showClaimModal, setShowClaimModal] = useState(false);
    const [claimListing, setClaimListing] = useState<Listing | null>(null);
    const [claimMessage, setClaimMessage] = useState("");
    const [claimTradeOffer, setClaimTradeOffer] = useState("");
    const [claiming, setClaiming] = useState(false);

    // Load saved listings from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("savedExchangeListings");
        if (saved) {
            try {
                setSavedListings(new Set(JSON.parse(saved)));
            } catch {}
        }
    }, []);

    // Handle URL params for opening specific listing modal
    const openListingFromUrl = useCallback((listingId: string) => {
        const listing = listings.find(l => l.id === listingId);
        if (listing) {
            setDetailsListing(listing);
            setShowDetailsModal(true);
        }
    }, [listings]);

    useEffect(() => {
        const listingId = searchParams.get("listing");
        if (listingId && listings.length > 0) {
            openListingFromUrl(listingId);
        }
    }, [searchParams, listings, openListingFromUrl]);

    // Handle URL params to auto-open create modal with pre-filled values
    useEffect(() => {
        const typeParam = searchParams.get("type");
        const modeParam = searchParams.get("mode");
        const titleParam = searchParams.get("title");
        const descriptionParam = searchParams.get("description");
        const quantityParam = searchParams.get("quantity");
        const dealTypeParam = searchParams.get("dealType");
        const deliveryParam = searchParams.get("delivery");
        
        if (typeParam || modeParam || titleParam) {
            // Pre-fill the form based on URL params
            setCreateForm(prev => ({
                ...prev,
                type: (typeParam as ListingType) || prev.type,
                mode: (modeParam as ListingMode) || prev.mode,
                title: titleParam || prev.title,
                description: descriptionParam || prev.description,
                quantity: quantityParam || prev.quantity,
                dealType: (dealTypeParam as DealType) || prev.dealType,
                deliveryMethod: (deliveryParam as DeliveryMethod) || prev.deliveryMethod,
            }));
            // Auto-open the create modal
            setShowCreateModal(true);
            
            // Clear the URL params after processing
            router.replace("/dashboard/exchange", { scroll: false });
        }
    }, [searchParams, router]);

    // Get user's location from farm profile on mount
    useEffect(() => {
        fetchUserProfile();
    }, []);

    // Fetch listings when location is available
    useEffect(() => {
        if (userCountry) {
            fetchListings();
        }
    }, [userCountry, filterType, filterStatus, filterMode]);

    const fetchUserProfile = async () => {
        try {
            // First try to get from farm profile (already has location)
            const profileRes = await fetch("/api/farm");
            if (profileRes.ok) {
                const data = await profileRes.json();
                if (data.profile && data.profile.latitude && data.profile.longitude) {
                    setUserLocation({
                        latitude: data.profile.latitude,
                        longitude: data.profile.longitude,
                        country: data.profile.country,
                        locationLabel: data.profile.locationLabel,
                    });
                    setUserCountry(data.profile.country || "US");
                    setLocationStatus("success");
                    return;
                }
            }
            // Fallback to IP-based country detection
            const response = await fetch("/api/geo");
            const geoData = await response.json();
            setUserCountry(geoData.country);
        } catch {
            setUserCountry("US"); // Fallback
        }
    };

    const detectLocation = async () => {
        setLocationStatus("detecting");
        setLocationError("");

        try {
            const location = await getUserLocation();
            const [country, locationLabel] = await Promise.all([
                getCountryFromCoords(location.latitude, location.longitude),
                getLocationLabel(location.latitude, location.longitude)
            ]);
            
            setUserLocation({
                ...location,
                country,
                locationLabel,
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
            
            // Pass user coordinates for distance calculation
            if (userLocation?.latitude && userLocation?.longitude) {
                params.set("lat", userLocation.latitude.toString());
                params.set("lon", userLocation.longitude.toString());
            }

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
                    deliveryMethod: createForm.deliveryMethod,
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
            deliveryMethod: "pickup",
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

    // Toggle save/bookmark listing
    const toggleSaveListing = (listingId: string) => {
        setSavedListings(prev => {
            const newSet = new Set(prev);
            if (newSet.has(listingId)) {
                newSet.delete(listingId);
            } else {
                newSet.add(listingId);
            }
            localStorage.setItem("savedExchangeListings", JSON.stringify([...newSet]));
            return newSet;
        });
    };

    // Share listing - copy link to clipboard
    const shareListing = async (listingId: string) => {
        const url = `${window.location.origin}/dashboard/exchange?listing=${listingId}`;
        try {
            await navigator.clipboard.writeText(url);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        } catch {
            // Fallback for older browsers
            const input = document.createElement("input");
            input.value = url;
            document.body.appendChild(input);
            input.select();
            document.execCommand("copy");
            document.body.removeChild(input);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        }
    };

    // Open view details modal
    const openDetails = (listing: Listing) => {
        setDetailsListing(listing);
        setShowDetailsModal(true);
        // Update URL without navigation
        window.history.pushState({}, "", `/dashboard/exchange?listing=${listing.id}`);
    };

    // Close view details modal
    const closeDetails = () => {
        setShowDetailsModal(false);
        setDetailsListing(null);
        // Remove listing param from URL
        window.history.pushState({}, "", "/dashboard/exchange");
    };

    // Open claim modal from details
    const openClaimFromDetails = () => {
        if (detailsListing) {
            setClaimListing(detailsListing);
            setShowDetailsModal(false);
            setShowClaimModal(true);
        }
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

    // Helper to extract first image URL from text
    const extractImageUrl = (text: string): string | null => {
        if (!text) return null;
        const imgUrlRegex = /(https?:\/\/\S+\.(?:png|jpg|jpeg|gif|webp|svg)(?:\?\S*)?)/gi;
        const match = imgUrlRegex.exec(text);
        return match ? match[0] : null;
    };

    // Helper to get distance to a listing (from API or calculated client-side)
    const getListingDistance = (listing: Listing): number | null => {
        // Use API-provided distance if available
        if (listing.distance !== undefined) {
            return listing.distance;
        }
        
        // Calculate client-side if we have user location and listing coordinates
        if (userLocation?.latitude && userLocation?.longitude && listing.latitude && listing.longitude) {
            const distance = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                listing.latitude,
                listing.longitude
            );
            return Math.round(distance * 10) / 10;
        }
        
        return null;
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

    // Filter listings by search query and delivery method
    const filteredListings = useMemo(() => {
        let result = listings;
        
        // Filter by delivery method
        if (filterDelivery) {
            result = result.filter((listing) => listing.deliveryMethod === filterDelivery);
        }
        
        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            result = result.filter((listing) => {
                return (
                    listing.title.toLowerCase().includes(query) ||
                    listing.description?.toLowerCase().includes(query) ||
                    listing.userName?.toLowerCase().includes(query) ||
                    listing.locationLabel?.toLowerCase().includes(query) ||
                    listing.tradeItems?.some(item => item.toLowerCase().includes(query))
                );
            });
        }
        
        return result;
    }, [listings, searchQuery, filterDelivery]);

    return (
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 min-h-[calc(100vh-8rem)]">
            {/* Mobile Filter Toggle Button */}
            <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="lg:hidden flex items-center justify-between w-full px-4 py-3 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]"
            >
                <span className="text-sm font-medium text-[var(--color-text-primary)]">Filters</span>
                <div className="flex items-center gap-2">
                    {(filterType || filterStatus || filterMode || filterDelivery) && (
                        <span className="text-xs text-[var(--color-primary)]">Active</span>
                    )}
                    <svg className={`w-4 h-4 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {/* Left Sidebar - Filters */}
            <div className={`${showMobileFilters ? 'block' : 'hidden'} lg:block w-full lg:w-72 flex-shrink-0`}>
                <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-5 sticky top-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Filters List</h2>
                            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                                Use the filters below to find the listings you are looking for
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-6">
                        <span className="text-xs text-[var(--color-text-secondary)]">
                            {filterType || filterStatus || filterMode || filterDelivery ? "Filters applied" : "No filters applied"}
                        </span>
                        <button
                            onClick={() => {
                                setFilterType("");
                                setFilterStatus("");
                                setFilterMode("");
                                setFilterDelivery("");
                            }}
                            className="p-1.5 rounded-lg bg-[var(--color-background)] hover:bg-[var(--color-border)] transition-colors"
                            title="Clear filters"
                        >
                            <RotateCcw className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
                        </button>
                        <button
                            onClick={() => fetchListings()}
                            className="px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-xs font-medium flex items-center gap-1.5"
                        >
                            Apply <Check className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Listing Type Filter */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">LISTING TYPE</h3>
                            <button onClick={() => setFilterType("")} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-2">
                            {[
                                { value: "", label: "All" },
                                { value: "seeds", label: t("exchange.types.seeds") },
                                { value: "produce", label: t("exchange.types.produce") },
                                { value: "fertilizer", label: t("exchange.types.fertilizer", "🌱 Fertilizer") },
                                { value: "tools", label: t("exchange.types.tools") },
                                { value: "other", label: t("exchange.types.other") },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setFilterType(option.value)}
                                    className="flex items-center gap-2 cursor-pointer w-full text-left hover:bg-[var(--color-background)] rounded p-1 -m-1 transition-colors"
                                >
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                        filterType === option.value 
                                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]" 
                                            : "border-[var(--color-border)]"
                                    }`}>
                                        {filterType === option.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                    </div>
                                    <span className="text-sm text-[var(--color-text-primary)]">{option.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Listing Status Filter */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">LISTING STATUS</h3>
                            <button onClick={() => setFilterStatus("")} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-xs text-[var(--color-text-secondary)] mb-2">
                            Find listings that are available, claimed, or completed
                        </p>
                        <div className="space-y-2">
                            {[
                                { value: "", label: "All" },
                                { value: "available", label: t("exchange.status.available") },
                                { value: "claimed", label: t("exchange.status.claimed") },
                                { value: "completed", label: t("exchange.status.completed") },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setFilterStatus(option.value)}
                                    className="flex items-center gap-2 cursor-pointer w-full text-left hover:bg-[var(--color-background)] rounded p-1 -m-1 transition-colors"
                                >
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                        filterStatus === option.value 
                                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]" 
                                            : "border-[var(--color-border)]"
                                    }`}>
                                        {filterStatus === option.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                    </div>
                                    <span className="text-sm text-[var(--color-text-primary)]">{option.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Mode Filter */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">MODE</h3>
                            <button onClick={() => setFilterMode("")} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-xs text-[var(--color-text-secondary)] mb-2">
                            Filter by offering or seeking
                        </p>
                        <div className="space-y-2">
                            {[
                                { value: "", label: "All" },
                                { value: "offering", label: t("exchange.mode.offering") },
                                { value: "seeking", label: t("exchange.mode.seeking") },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setFilterMode(option.value)}
                                    className="flex items-center gap-2 cursor-pointer w-full text-left hover:bg-[var(--color-background)] rounded p-1 -m-1 transition-colors"
                                >
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                        filterMode === option.value 
                                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]" 
                                            : "border-[var(--color-border)]"
                                    }`}>
                                        {filterMode === option.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                    </div>
                                    <span className="text-sm text-[var(--color-text-primary)]">{option.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Delivery Method Filter */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">DELIVERY</h3>
                            <button onClick={() => setFilterDelivery("")} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-xs text-[var(--color-text-secondary)] mb-2">
                            Filter by delivery method
                        </p>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            <button
                                type="button"
                                onClick={() => setFilterDelivery("")}
                                className="flex items-center gap-2 cursor-pointer w-full text-left hover:bg-[var(--color-background)] rounded p-1 -m-1 transition-colors"
                            >
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                    filterDelivery === "" 
                                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]" 
                                        : "border-[var(--color-border)]"
                                }`}>
                                    {filterDelivery === "" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </div>
                                <span className="text-sm text-[var(--color-text-primary)]">All</span>
                            </button>
                            {DELIVERY_METHODS.map((method) => (
                                <button
                                    key={method.value}
                                    type="button"
                                    onClick={() => setFilterDelivery(method.value)}
                                    className="flex items-center gap-2 cursor-pointer w-full text-left hover:bg-[var(--color-background)] rounded p-1 -m-1 transition-colors"
                                >
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                        filterDelivery === method.value 
                                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]" 
                                            : "border-[var(--color-border)]"
                                    }`}>
                                        {filterDelivery === method.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                    </div>
                                    <span className="text-sm text-[var(--color-text-primary)]">{method.emoji} {method.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">LOCATION</h3>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
                            <span className="flex-1">
                                {userLocation?.locationLabel 
                                    ? userLocation.locationLabel 
                                    : getCountryName(userCountry)}
                            </span>
                        </div>
                        {userLocation?.latitude && userLocation?.longitude && (
                            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                                {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                            </p>
                        )}
                        {locationError && (
                            <p className="text-xs text-red-500 mt-2 leading-tight">
                                {locationError}
                            </p>
                        )}
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={detectLocation}
                            disabled={locationStatus === "detecting"}
                            className="mt-2 w-full text-xs"
                        >
                            {locationStatus === "detecting"
                                ? t("exchange.create.locationDetecting")
                                : userLocation ? "Update Location" : t("exchange.create.useMyLocation")}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
                {/* Header with Search */}
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
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                        >
                            ×
                        </button>
                    )}
                </div>

                {/* Listings Grid */}
                {loading ? (
                    <div className="text-center py-12 text-[var(--color-text-secondary)]">
                        {t("common.loading")}
                    </div>
                ) : filteredListings.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-[var(--color-text-secondary)]">
                                {searchQuery ? "No listings match your search" : t("exchange.listing.noListings")}
                            </p>
                            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                                {searchQuery ? "Try different keywords or clear the search" : t("exchange.listing.noListingsDescription")}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredListings.map((listing) => (
                            <div key={listing.id} className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] overflow-hidden flex flex-col">
                                {/* Card Image/Header */}
                                <div className="relative h-36 bg-gradient-to-br from-green-800 to-green-950 overflow-hidden">
                                    {/* Background image from description if available */}
                                    {extractImageUrl(listing.description) && (
                                        <img
                                            src={extractImageUrl(listing.description)!}
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
                                    {/* Decorative pattern (only show if no image) */}
                                    {!extractImageUrl(listing.description) && (
                                        <div className="absolute inset-0 opacity-20">
                                            <div className="absolute top-4 right-4 w-24 h-24 border border-white/20 rounded-full" />
                                            <div className="absolute bottom-4 left-4 w-16 h-16 border border-white/20 rounded-full" />
                                        </div>
                                    )}
                                    {/* Bottom badges */}
                                    <div className="absolute bottom-0 left-0 right-0 px-3 py-2 flex items-center justify-between bg-gradient-to-t from-black/40">
                                        <div className="flex items-center gap-1.5 text-white text-xs">
                                            <span>{listing.quantity || "Qty N/A"}</span>
                                        </div>
                                        <Badge className={`text-xs font-medium ${
                                            listing.type === "seeds" ? "bg-green-500 text-white" :
                                            listing.type === "produce" ? "bg-amber-500 text-white" :
                                            listing.type === "tools" ? "bg-blue-500 text-white" :
                                            "bg-gray-500 text-white"
                                        }`}>
                                            {t(`exchange.types.${listing.type}`).toUpperCase()}
                                        </Badge>
                                    </div>
                                    {/* Top right bookmark icon */}
                                    <button 
                                        onClick={() => toggleSaveListing(listing.id)}
                                        className="absolute top-3 right-3 p-1.5 rounded bg-white/10 hover:bg-white/20 transition-colors"
                                    >
                                        {savedListings.has(listing.id) ? (
                                            <BookmarkCheck className="w-4 h-4 text-yellow-400" />
                                        ) : (
                                            <Bookmark className="w-4 h-4 text-white" />
                                        )}
                                    </button>
                                </div>

                                {/* Card Content */}
                                <div className="p-4 flex-1 flex flex-col">
                                    {/* ID */}
                                    <p className="text-xs text-[var(--color-text-secondary)] font-mono mb-1">
                                        # {listing.id.slice(0, 8)}...{listing.id.slice(-8)}
                                    </p>
                                    
                                    {/* Title with actions */}
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h3 className="font-semibold text-[var(--color-text-primary)] line-clamp-1">
                                            {listing.title}
                                        </h3>
                                        <div className="flex items-center gap-1">
                                            <button 
                                                onClick={() => toggleSaveListing(listing.id)}
                                                className="p-1 hover:bg-[var(--color-surface)] rounded transition-colors"
                                                title={savedListings.has(listing.id) ? "Remove from saved" : "Save listing"}
                                            >
                                                {savedListings.has(listing.id) ? (
                                                    <BookmarkCheck className="w-4 h-4 text-yellow-500" />
                                                ) : (
                                                    <Bookmark className="w-4 h-4 text-[var(--color-text-secondary)]" />
                                                )}
                                            </button>
                                            <button 
                                                onClick={() => shareListing(listing.id)}
                                                className="p-1 hover:bg-[var(--color-surface)] rounded transition-colors"
                                                title="Copy link"
                                            >
                                                <LinkIcon className="w-4 h-4 text-[var(--color-text-secondary)]" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Status & Deal Type Badges */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <Badge className={`text-xs ${
                                            listing.status === "available" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                                            listing.status === "claimed" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" :
                                            "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                                        }`}>
                                            {listing.status.toUpperCase()}
                                        </Badge>
                                        {getDealTypeBadge(listing)}
                                    </div>

                                    {/* User */}
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-xs text-white font-medium">
                                            {(listing.userName || "U")[0].toUpperCase()}
                                        </div>
                                        <span className="text-sm text-[var(--color-primary)] font-medium">
                                            {listing.userName || "Anonymous"}
                                        </span>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-2 py-3 border-t border-[var(--color-border)]">
                                        <div className="text-center">
                                            <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide">Claims</p>
                                            <p className="text-lg font-semibold text-[var(--color-text-primary)]">{listing.claimCount || 0}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide">Distance</p>
                                            <p className="text-lg font-semibold text-[var(--color-text-primary)]">
                                                {getListingDistance(listing) !== null 
                                                    ? `${getListingDistance(listing)}km` 
                                                    : userLocation ? "N/A" : "GPS"}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide">Delivery</p>
                                            <p className="text-lg" title={DELIVERY_METHODS.find(m => m.value === listing.deliveryMethod)?.label || "Pick-up"}>
                                                {DELIVERY_METHODS.find(m => m.value === listing.deliveryMethod)?.emoji || "📍"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-2 gap-2 mt-auto pt-3">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full text-xs"
                                            onClick={() => openDetails(listing)}
                                        >
                                            View Details
                                        </Button>
                                        {!listing.isOwner && listing.status === "available" && (
                                            <Button
                                                size="sm"
                                                className="w-full text-xs"
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
                                        {(listing.isOwner || listing.status !== "available") && (
                                            <Button
                                                size="sm"
                                                className="w-full text-xs"
                                                variant="secondary"
                                                onClick={() => openDetails(listing)}
                                            >
                                                View Status
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Link copied toast */}
                {linkCopied && (
                    <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
                        Link copied to clipboard!
                    </div>
                )}
            </div>

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
                            { value: "fertilizer", label: t("exchange.types.fertilizer", "🌱 Fertilizer/Compost") },
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
                                {getCountryName(userCountry)}
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

                    {/* Delivery Method */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            {t("exchange.create.deliveryLabel", "Delivery Method")}
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {DELIVERY_METHODS.map((method) => (
                                <button
                                    key={method.value}
                                    type="button"
                                    onClick={() => setCreateForm({ ...createForm, deliveryMethod: method.value })}
                                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                                        createForm.deliveryMethod === method.value
                                            ? "border-primary bg-primary/10"
                                            : "border-border hover:border-primary/50"
                                    }`}
                                >
                                    <span className="text-2xl">{method.emoji}</span>
                                    <span className="text-xs text-center">{method.label}</span>
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            {t("exchange.create.deliveryNote", "Select how you can deliver or receive this item during emergencies")}
                        </p>
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

            {/* View Details Modal */}
            <Modal
                isOpen={showDetailsModal}
                onClose={closeDetails}
                title="Listing Details"
            >
                {detailsListing && (
                    <div className="space-y-4">
                        {/* Image */}
                        {extractImageUrl(detailsListing.description) && (
                            <div className="rounded-lg overflow-hidden">
                                <img
                                    src={extractImageUrl(detailsListing.description)!}
                                    alt={detailsListing.title}
                                    className="w-full h-48 object-cover"
                                />
                            </div>
                        )}

                        {/* Title and badges */}
                        <div>
                            <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">
                                {detailsListing.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <Badge className={`text-xs ${
                                    detailsListing.status === "available" ? "bg-green-100 text-green-800" :
                                    detailsListing.status === "claimed" ? "bg-amber-100 text-amber-800" :
                                    "bg-gray-100 text-gray-800"
                                }`}>
                                    {detailsListing.status.toUpperCase()}
                                </Badge>
                                <Badge className={`text-xs ${
                                    detailsListing.type === "seeds" ? "bg-green-500 text-white" :
                                    detailsListing.type === "produce" ? "bg-amber-500 text-white" :
                                    detailsListing.type === "tools" ? "bg-blue-500 text-white" :
                                    "bg-gray-500 text-white"
                                }`}>
                                    {t(`exchange.types.${detailsListing.type}`).toUpperCase()}
                                </Badge>
                                {getDealTypeBadge(detailsListing)}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="p-3 bg-[var(--color-surface)] rounded-lg">
                            <p className="text-sm font-medium mb-1">Description</p>
                            <div className="text-sm text-[var(--color-text-secondary)]">
                                {renderDescription(detailsListing.description)}
                            </div>
                        </div>

                        {/* Details grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {detailsListing.quantity && (
                                <div>
                                    <p className="text-xs text-[var(--color-text-secondary)] uppercase">Quantity</p>
                                    <p className="text-sm font-medium">{detailsListing.quantity}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-xs text-[var(--color-text-secondary)] uppercase">Mode</p>
                                <p className="text-sm font-medium">{detailsListing.mode === "offering" ? "Offering" : "Seeking"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-[var(--color-text-secondary)] uppercase">Posted by</p>
                                <p className="text-sm font-medium">{detailsListing.userName || "Anonymous"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-[var(--color-text-secondary)] uppercase">Location</p>
                                <p className="text-sm font-medium">{detailsListing.locationLabel || getCountryName(detailsListing.country)}</p>
                            </div>
                            {getListingDistance(detailsListing) !== null && (
                                <div>
                                    <p className="text-xs text-[var(--color-text-secondary)] uppercase">Distance</p>
                                    <p className="text-sm font-medium">{getListingDistance(detailsListing)}km away</p>
                                </div>
                            )}
                            <div>
                                <p className="text-xs text-[var(--color-text-secondary)] uppercase">Delivery</p>
                                <p className="text-sm font-medium flex items-center gap-2">
                                    <span>{DELIVERY_METHODS.find(m => m.value === detailsListing.deliveryMethod)?.emoji || "📍"}</span>
                                    {DELIVERY_METHODS.find(m => m.value === detailsListing.deliveryMethod)?.label || "Pick-up at location"}
                                </p>
                            </div>
                        </div>

                        {/* Trade items if applicable */}
                        {detailsListing.dealType === "trade" && detailsListing.tradeItems && detailsListing.tradeItems.length > 0 && (
                            <div>
                                <p className="text-sm font-medium mb-2">
                                    {detailsListing.mode === "offering" ? "Wants in return:" : "Looking for:"}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {detailsListing.tradeItems.map((item, i) => (
                                        <Badge key={i} variant="secondary" className="text-xs">
                                            {item}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    toggleSaveListing(detailsListing.id);
                                }}
                                className="flex items-center gap-2"
                            >
                                {savedListings.has(detailsListing.id) ? (
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
                            <Button
                                variant="outline"
                                onClick={() => shareListing(detailsListing.id)}
                                className="flex items-center gap-2"
                            >
                                <LinkIcon className="w-4 h-4" />
                                Share
                            </Button>
                            {!detailsListing.isOwner && detailsListing.status === "available" && (
                                <Button
                                    onClick={openClaimFromDetails}
                                    className="flex-1"
                                >
                                    {detailsListing.dealType === "trade"
                                        ? t("exchange.listing.offerTradeButton")
                                        : t("exchange.listing.claimButton")}
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
