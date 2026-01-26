"use client";

import { useState, useCallback, useEffect } from "react";
import type { FarmProfileData, EditableProfileData } from "../types";

export function useFarmProfile() {
    const [profile, setProfile] = useState<FarmProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editData, setEditData] = useState<EditableProfileData>({});

    const fetchProfile = useCallback(async () => {
        try {
            const res = await fetch("/api/farm");
            if (res.ok) {
                const data = await res.json();
                setProfile(data.profile);
                setEditData(data.profile || {});
            }
        } catch (error) {
            console.error("Failed to fetch profile:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const startEditing = useCallback(() => {
        setEditing(true);
    }, []);

    const cancelEditing = useCallback(() => {
        setEditing(false);
        setEditData(profile || {});
    }, [profile]);

    const updateField = useCallback(<K extends keyof EditableProfileData>(
        key: K,
        value: EditableProfileData[K]
    ) => {
        setEditData((prev) => ({ ...prev, [key]: value }));
    }, []);

    const updateLocation = useCallback((lat: number, lng: number, label?: string) => {
        setEditData((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            locationLabel: label,
        }));
    }, []);

    const saveProfile = useCallback(async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/farm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...editData,
                    onboardingCompleted: true,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setProfile(data.profile);
                setEditing(false);
            }
        } catch (error) {
            console.error("Failed to save profile:", error);
        } finally {
            setSaving(false);
        }
    }, [editData]);

    return {
        profile,
        loading,
        editing,
        saving,
        editData,
        startEditing,
        cancelEditing,
        updateField,
        updateLocation,
        saveProfile,
    };
}
