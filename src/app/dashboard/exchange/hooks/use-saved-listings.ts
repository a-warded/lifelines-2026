"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "savedExchangeListings";

interface UseSavedListingsReturn {
  savedListings: Set<string>;
  toggleSave: (listingId: string) => void;
  isSaved: (listingId: string) => boolean;
}

export function useSavedListings(): UseSavedListingsReturn {
    const [savedListings, setSavedListings] = useState<Set<string>>(new Set());

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                setSavedListings(new Set(JSON.parse(saved)));
            }
        } catch {
            // Ignore parse errors
        }
    }, []);

    const toggleSave = useCallback((listingId: string) => {
        setSavedListings(prev => {
            const newSet = new Set(prev);
            if (newSet.has(listingId)) {
                newSet.delete(listingId);
            } else {
                newSet.add(listingId);
            }
      
            // Persist to localStorage
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify([...newSet]));
            } catch {
                // Ignore storage errors
            }
      
            return newSet;
        });
    }, []);

    const isSaved = useCallback((listingId: string) => {
        return savedListings.has(listingId);
    }, [savedListings]);

    return {
        savedListings,
        toggleSave,
        isSaved,
    };
}
