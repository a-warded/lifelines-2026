"use client";

import { useState, useCallback, useEffect } from "react";
import {
    calculateWater,
    type WaterEntry,
} from "@/lib/logic/water-calculator";
import type { PlantEntry, WaterHistory, WaterCalculationResult } from "../types";

const DEFAULT_ENTRY: PlantEntry = {
    id: "1",
    plantId: "",
    stage: "vegetative",
    count: 1,
};

const STORAGE_KEY = "waterHistory";
const MAX_HISTORY = 10;

// Hook for managing plant entries and water calculation
export function useWaterCalculator() {
    const [entries, setEntries] = useState<PlantEntry[]>([DEFAULT_ENTRY]);
    const [result, setResult] = useState<WaterCalculationResult | null>(null);

    const calculateResult = useCallback(() => {
        const validEntries: WaterEntry[] = entries
            .filter((e) => e.plantId && e.count > 0)
            .map((e) => ({
                plantId: e.plantId,
                stage: e.stage,
                count: e.count,
            }));

        if (validEntries.length > 0) {
            const calcResult = calculateWater(validEntries);
            setResult(calcResult);
        } else {
            setResult(null);
        }
    }, [entries]);

    useEffect(() => {
        calculateResult();
    }, [calculateResult]);

    const addEntry = useCallback(() => {
        setEntries((prev) => [
            ...prev,
            {
                id: Date.now().toString(),
                plantId: "",
                stage: "vegetative",
                count: 1,
            },
        ]);
    }, []);

    const removeEntry = useCallback((id: string) => {
        setEntries((prev) => {
            if (prev.length > 1) {
                return prev.filter((e) => e.id !== id);
            }
            return prev;
        });
    }, []);

    const updateEntry = useCallback(
        (id: string, field: keyof PlantEntry, value: string | number) => {
            setEntries((prev) =>
                prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
            );
        },
        []
    );

    const clearAll = useCallback(() => {
        setEntries([{ ...DEFAULT_ENTRY, id: Date.now().toString() }]);
        setResult(null);
    }, []);

    return {
        entries,
        result,
        addEntry,
        removeEntry,
        updateEntry,
        clearAll,
    };
}

// Hook for managing calculation history with localStorage
export function useWaterHistory() {
    const [history, setHistory] = useState<WaterHistory[]>([]);

    useEffect(() => {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
            try {
                setHistory(JSON.parse(cached));
            } catch {
                // Ignore parse errors
            }
        }
    }, []);

    const saveCalculation = useCallback((result: WaterCalculationResult) => {
        if (!result || result.entries.length === 0) return;

        const newEntry: WaterHistory = {
            date: new Date().toISOString(),
            total: result.totalDailyLiters,
            plants: result.entries.map((e) => e.plantName),
        };

        setHistory((prev) => {
            const updated = [newEntry, ...prev.slice(0, MAX_HISTORY - 1)];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    const clearHistory = useCallback(() => {
        setHistory([]);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    return {
        history,
        saveCalculation,
        clearHistory,
    };
}
