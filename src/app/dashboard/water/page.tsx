"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
    calculateWater,
    GROWTH_STAGES,
    GrowthStage,
    WaterCalculationResult,
    WaterEntry,
} from "@/lib/logic/water-calculator";
import { getPlantOptions } from "@/lib/plants";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

interface PlantEntry {
    id: string;
    plantId: string;
    stage: GrowthStage;
    count: number;
}

export default function WaterCalculatorPage() {
    const { t } = useTranslation();
    const plantOptions = useMemo(() => getPlantOptions(), []);
    
    const [entries, setEntries] = useState<PlantEntry[]>([
        { id: "1", plantId: "", stage: "vegetative", count: 1 },
    ]);
    
    const [result, setResult] = useState<WaterCalculationResult | null>(null);
    const [history, setHistory] = useState<Array<{ date: string; total: number; plants: string[] }>>([]);

    // Calculate water instantly whenever entries change
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

    // Recalculate on every entry change
    useEffect(() => {
        calculateResult();
    }, [calculateResult]);

    // Load history from localStorage
    useEffect(() => {
        const cached = localStorage.getItem("waterHistory");
        if (cached) {
            try {
                setHistory(JSON.parse(cached));
            } catch {
                // Ignore parse errors
            }
        }
    }, []);

    const addEntry = () => {
        setEntries([
            ...entries,
            {
                id: Date.now().toString(),
                plantId: "",
                stage: "vegetative",
                count: 1,
            },
        ]);
    };

    const removeEntry = (id: string) => {
        if (entries.length > 1) {
            setEntries(entries.filter((e) => e.id !== id));
        }
    };

    const updateEntry = (id: string, field: keyof PlantEntry, value: string | number) => {
        setEntries(
            entries.map((e) =>
                e.id === id ? { ...e, [field]: value } : e
            )
        );
    };

    const saveCalculation = () => {
        if (!result || result.entries.length === 0) return;

        const newHistory = [
            {
                date: new Date().toISOString(),
                total: result.totalDailyLiters,
                plants: result.entries.map((e) => e.plantName),
            },
            ...history.slice(0, 9), // Keep last 10
        ];
        
        setHistory(newHistory);
        localStorage.setItem("waterHistory", JSON.stringify(newHistory));
    };

    const clearAll = () => {
        setEntries([{ id: "1", plantId: "", stage: "vegetative", count: 1 }]);
        setResult(null);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                    {t("water.title")}
                </h1>
                <p className="text-[var(--color-text-secondary)] mt-1">
                    {t("water.subtitle")}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left column - Plant entries */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                <span>{t("water.title")}</span>
                                <Button size="sm" onClick={addEntry}>
                                    + {t("water.addPlant")}
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {entries.map((entry, index) => (
                                <div
                                    key={entry.id}
                                    className="p-4 border border-[var(--color-border)] rounded-lg space-y-3"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-sm">
                                            {t("water.plantLabel")} {index + 1}
                                        </span>
                                        {entries.length > 1 && (
                                            <button
                                                onClick={() => removeEntry(entry.id)}
                                                className="text-red-500 text-sm hover:underline"
                                            >
                                                {t("water.removePlant")}
                                            </button>
                                        )}
                                    </div>

                                    <Select
                                        value={entry.plantId}
                                        onChange={(e) =>
                                            updateEntry(entry.id, "plantId", e.target.value)
                                        }
                                        options={[
                                            { value: "", label: t("water.selectPlant") },
                                            ...plantOptions,
                                        ]}
                                    />

                                    <div className="grid grid-cols-2 gap-3">
                                        <Select
                                            label={t("water.stageLabel")}
                                            value={entry.stage}
                                            onChange={(e) =>
                                                updateEntry(
                                                    entry.id,
                                                    "stage",
                                                    e.target.value as GrowthStage
                                                )
                                            }
                                            options={GROWTH_STAGES.map((s) => ({
                                                value: s.value,
                                                label: t(`water.stages.${s.value}`),
                                            }))}
                                        />

                                        <Input
                                            type="number"
                                            label={t("water.countLabel")}
                                            min={1}
                                            max={1000}
                                            value={entry.count}
                                            onChange={(e) =>
                                                updateEntry(
                                                    entry.id,
                                                    "count",
                                                    parseInt(e.target.value) || 1
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            ))}

                            <div className="flex gap-2 pt-2">
                                <Button
                                    variant="secondary"
                                    onClick={saveCalculation}
                                    disabled={!result}
                                    className="flex-1"
                                >
                                    {t("water.actions.save")}
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={clearAll}
                                    className="flex-1"
                                >
                                    {t("water.actions.clear")}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right column - Results */}
                <div className="space-y-4">
                    {/* Total Result */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("water.results.title")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {result && result.entries.length > 0 ? (
                                <div className="space-y-4">
                                    {/* Big total */}
                                    <div className="text-center py-4">
                                        <div className="text-5xl font-bold text-[var(--color-primary)]">
                                            {result.totalDailyLiters}
                                        </div>
                                        <div className="text-[var(--color-text-secondary)] mt-1">
                                            {t("units.liters")}/{t("units.days").toLowerCase()}
                                        </div>
                                    </div>

                                    {/* Warning */}
                                    {result.warning && (
                                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                                            {result.warning}
                                        </div>
                                    )}

                                    {/* Breakdown */}
                                    <div>
                                        <h4 className="font-medium mb-2 text-sm">
                                            {t("water.results.breakdown")}
                                        </h4>
                                        <div className="space-y-2">
                                            {result.entries.map((entry, i) => (
                                                <div
                                                    key={i}
                                                    className="flex justify-between items-center p-2 bg-[var(--color-surface)] rounded"
                                                >
                                                    <div>
                                                        <span className="font-medium">
                                                            {entry.plantName}
                                                        </span>
                                                        <span className="text-[var(--color-text-secondary)] text-sm ml-2">
                                                            ×{entry.count}
                                                        </span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="font-medium">
                                                            {entry.totalLiters}L
                                                        </span>
                                                        <span className="text-[var(--color-text-secondary)] text-sm ml-1">
                                                            ({entry.litersPerPlant}L/plant)
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-[var(--color-text-secondary)]">
                                    {t("water.results.noPlants")}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Tips */}
                    {result && result.tips.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>💧 {t("common.info")}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {result.tips.map((tip, i) => (
                                        <li
                                            key={i}
                                            className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]"
                                        >
                                            <span className="text-green-500 mt-0.5">•</span>
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                    {/* History */}
                    {history.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("water.history.title")}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {history.slice(0, 5).map((h, i) => (
                                        <div
                                            key={i}
                                            className="flex justify-between items-center p-2 bg-[var(--color-surface)] rounded text-sm"
                                        >
                                            <div className="flex flex-wrap gap-1">
                                                {h.plants.slice(0, 3).map((p, j) => (
                                                    <Badge key={j} variant="secondary">
                                                        {p}
                                                    </Badge>
                                                ))}
                                                {h.plants.length > 3 && (
                                                    <Badge variant="secondary">
                                                        +{h.plants.length - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="font-medium">{h.total}L</div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
