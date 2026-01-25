"use client";

import type { GeoLocation } from "@/lib/geo";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_CREATE_FORM } from "../constants";
import type { CreateListingForm, ExchangeFilters, Listing } from "../types";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

interface UseExchangeListingsOptions {
  userCountry: string;
  userLocation: GeoLocation | null;
  isLocationReady: boolean;
}

interface UseExchangeListingsReturn {
  listings: Listing[];
  loading: boolean;
  error: string;
  filters: ExchangeFilters;
  setFilter: <K extends keyof ExchangeFilters>(key: K, value: ExchangeFilters[K]) => void;
  clearFilters: () => void;
  refetch: () => Promise<void>;
  filteredListings: Listing[];
  pagination: Pagination;
  setPage: (page: number) => void;
}

export function useExchangeListings({ 
  userCountry, 
  userLocation,
  isLocationReady,
}: UseExchangeListingsOptions): UseExchangeListingsReturn {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasMore: false,
  });
  const [filters, setFilters] = useState<ExchangeFilters>({
    type: "",
    status: "",
    mode: "",
    delivery: "",
    searchQuery: "",
  });
  
  // Use refs to track fetch state and prevent race conditions
  const fetchIdRef = useRef(0);
  const hasFetchedRef = useRef(false);

  const setFilter = useCallback(<K extends keyof ExchangeFilters>(
    key: K, 
    value: ExchangeFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      type: "",
      status: "",
      mode: "",
      delivery: "",
      searchQuery: "",
    });
    setCurrentPage(1);
  }, []);

  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const fetchListings = useCallback(async () => {
    const fetchId = ++fetchIdRef.current;
    
    // Only show loading on initial fetch, not on refetch
    if (!hasFetchedRef.current) {
      setLoading(true);
    }
    setError("");

    try {
      const params = new URLSearchParams();
      if (filters.type) params.set("type", filters.type);
      if (filters.status) params.set("status", filters.status);
      if (filters.mode) params.set("mode", filters.mode);
      // Don't filter by country - show all listings globally
      // This allows seeing seeded data regardless of user's location
      params.set("page", currentPage.toString());
      params.set("limit", "12");

      if (userLocation?.latitude && userLocation?.longitude) {
        params.set("lat", userLocation.latitude.toString());
        params.set("lon", userLocation.longitude.toString());
      }

      const response = await fetch(`/api/exchange?${params}`);
      
      // Check if this fetch is still the latest one
      if (fetchId !== fetchIdRef.current) {
        return; // Abort if a newer fetch has been initiated
      }
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch listings");
      }

      setListings(data.listings || []);
      if (data.pagination) {
        setPagination(data.pagination);
      }
      hasFetchedRef.current = true;
    } catch (err) {
      // Only set error if this is still the latest fetch
      if (fetchId === fetchIdRef.current) {
        setError(err instanceof Error ? err.message : "Failed to load listings");
      }
    } finally {
      // Only update loading if this is still the latest fetch
      if (fetchId === fetchIdRef.current) {
        setLoading(false);
      }
    }
  }, [userLocation, filters.type, filters.status, filters.mode, currentPage]);

  // Fetch on mount and when dependencies change, but only after location is ready
  useEffect(() => {
    if (isLocationReady) {
      fetchListings();
    }
  }, [fetchListings, isLocationReady]);

  // Client-side filtering for delivery method and search
  const filteredListings = useMemo(() => {
    let result = listings;

    if (filters.delivery) {
      result = result.filter(listing => listing.deliveryMethod === filters.delivery);
    }

    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase().trim();
      result = result.filter(listing => 
        listing.title.toLowerCase().includes(query) ||
        listing.description?.toLowerCase().includes(query) ||
        listing.userName?.toLowerCase().includes(query) ||
        listing.locationLabel?.toLowerCase().includes(query) ||
        listing.tradeItems?.some(item => item.toLowerCase().includes(query))
      );
    }

    return result;
  }, [listings, filters.delivery, filters.searchQuery]);

  return {
    listings,
    loading,
    error,
    filters,
    setFilter,
    clearFilters,
    refetch: fetchListings,
    filteredListings,
    pagination,
    setPage,
  };
}

// Hook for managing create listing form
interface UseCreateListingOptions {
  userCountry: string;
  userLocation: GeoLocation | null;
  onSuccess: () => void;
}

interface UseCreateListingReturn {
  form: CreateListingForm;
  updateForm: <K extends keyof CreateListingForm>(key: K, value: CreateListingForm[K]) => void;
  resetForm: () => void;
  addTradeItem: () => void;
  removeTradeItem: (index: number) => void;
  submitListing: () => Promise<void>;
  isSubmitting: boolean;
}

export function useCreateListing({
  userCountry,
  userLocation,
  onSuccess,
}: UseCreateListingOptions): UseCreateListingReturn {
  const [form, setForm] = useState<CreateListingForm>(DEFAULT_CREATE_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateForm = useCallback(<K extends keyof CreateListingForm>(
    key: K, 
    value: CreateListingForm[K]
  ) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setForm(DEFAULT_CREATE_FORM);
  }, []);

  const addTradeItem = useCallback(() => {
    if (form.newTradeItem.trim()) {
      setForm(prev => ({
        ...prev,
        tradeItems: [...prev.tradeItems, prev.newTradeItem.trim()],
        newTradeItem: "",
      }));
    }
  }, [form.newTradeItem]);

  const removeTradeItem = useCallback((index: number) => {
    setForm(prev => ({
      ...prev,
      tradeItems: prev.tradeItems.filter((_, i) => i !== index),
    }));
  }, []);

  const submitListing = useCallback(async () => {
    if (!form.title.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: form.mode,
          type: form.type,
          plantId: form.plantId || undefined,
          title: form.title,
          description: form.description,
          quantity: form.quantity,
          dealType: form.dealType,
          price: form.dealType === "price" ? parseFloat(form.price) : undefined,
          tradeItems: form.dealType === "trade" ? form.tradeItems : undefined,
          deliveryMethod: form.deliveryMethod,
          latitude: userLocation?.latitude,
          longitude: userLocation?.longitude,
          country: userCountry,
          locationLabel: userLocation 
            ? `${userLocation.latitude.toFixed(2)}, ${userLocation.longitude.toFixed(2)}` 
            : undefined,
        }),
      });

      if (response.ok) {
        resetForm();
        onSuccess();
      }
    } catch (err) {
      console.error("Create error:", err);
    } finally {
      setIsSubmitting(false);
    }
  }, [form, userCountry, userLocation, onSuccess, resetForm]);

  return {
    form,
    updateForm,
    resetForm,
    addTradeItem,
    removeTradeItem,
    submitListing,
    isSubmitting,
  };
}

// Hook for claiming a listing
interface UseClaimListingOptions {
  onSuccess: () => void;
}

interface UseClaimListingReturn {
  claimListing: (listingId: string, message: string, tradeOffer?: string) => Promise<void>;
  isClaiming: boolean;
}

export function useClaimListing({ onSuccess }: UseClaimListingOptions): UseClaimListingReturn {
  const [isClaiming, setIsClaiming] = useState(false);

  const claimListing = useCallback(async (
    listingId: string, 
    message: string, 
    tradeOffer?: string
  ) => {
    setIsClaiming(true);
    try {
      const response = await fetch("/api/exchange/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          message,
          tradeOffer,
        }),
      });

      if (response.ok) {
        onSuccess();
      }
    } catch (err) {
      console.error("Claim error:", err);
    } finally {
      setIsClaiming(false);
    }
  }, [onSuccess]);

  return { claimListing, isClaiming };
}
