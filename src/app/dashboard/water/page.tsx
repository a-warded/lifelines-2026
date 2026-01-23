"use client";

import {
    Badge,
    Button,
    Card,
    CardContent,
    Input,
    OfflineBadge,
    Select,
} from "@/components/ui";
import { cacheWaterCalculation, getCachedWaterCalculation } from "@/lib/offline-storage";
import {
    AlertTriangle,
    ArrowLeft,
    Calculator,
    Droplets,
    History,
    Loader2,
    Save,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

interface WaterResult {
  dailyLiters: number;
  weeklyLiters: number;
  survivalDailyLiters: number;
  warnings: string[];
  id?: string;
}

interface FormData {
  cropType: string;
  numberOfPlants: number;
  growthStage: string;
  waterAvailability: string;
}

const CROP_OPTIONS = [
    { value: "tomato", label: "Tomato" },
    { value: "potato", label: "Potato" },
    { value: "beans", label: "Beans/Legumes" },
    { value: "leafyGreens", label: "Leafy Greens" },
    { value: "cucumber", label: "Cucumber" },
    { value: "herbs", label: "Herbs" },
    { value: "onions", label: "Onions/Garlic" },
];

const GROWTH_STAGES = [
    { value: "seedling", label: "Seedling" },
    { value: "growing", label: "Growing" },
    { value: "fruiting", label: "Fruiting/Mature" },
];

const WATER_LEVELS = [
    { value: "none", label: "None" },
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
];

function WaterCalculatorContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [formData, setFormData] = useState<FormData>({
        cropType: searchParams.get("crop") || "tomato",
        numberOfPlants: parseInt(searchParams.get("plants") || "4"),
        growthStage: "growing",
        waterAvailability: "medium",
    });

    const [result, setResult] = useState<WaterResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState<
    Array<{
      id: string;
      cropType: string;
      numberOfPlants: number;
      dailyLiters: number;
      createdAt: string;
    }>
  >([]);

    // Load cached result on mount
    useEffect(() => {
        const cached = getCachedWaterCalculation<WaterResult>();
        if (cached) {
            setResult(cached);
        }
    }, []);

    const handleChange = (field: keyof FormData, value: string | number) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setResult(null); // Clear result when form changes
    };

    const calculate = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/water", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    save: false,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setResult(data.result);
                cacheWaterCalculation(data.result);
            }
        } catch (error) {
            console.error("Calculation failed:", error);
            // Use cached if available
            const cached = getCachedWaterCalculation<WaterResult>();
            if (cached) {
                setResult(cached);
            }
        } finally {
            setLoading(false);
        }
    };

    const saveResult = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/water", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    save: true,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setResult(data.result);
                cacheWaterCalculation(data.result);
            }
        } catch (error) {
            console.error("Save failed:", error);
        } finally {
            setSaving(false);
        }
    };

    const fetchHistory = useCallback(async () => {
        try {
            const res = await fetch("/api/water?limit=10");
            if (res.ok) {
                const data = await res.json();
                setHistory(data.calculations);
            }
        } catch (error) {
            console.error("Failed to fetch history:", error);
        }
    }, []);

    useEffect(() => {
        if (showHistory) {
            fetchHistory();
        }
    }, [showHistory, fetchHistory]);

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="shrink-0"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-foreground">
            Water Calculator
                    </h1>
                    <p className="text-sm text-muted-foreground">
            Calculate water needs for your crops
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHistory(!showHistory)}
                >
                    <History className="mr-2 h-4 w-4" />
          History
                </Button>
            </div>

            {/* History Panel */}
            {showHistory && history.length > 0 && (
                <Card>
                    <CardContent>
                        <h3 className="mb-3 font-semibold">Recent Calculations</h3>
                        <div className="space-y-2">
                            {history.map((calc) => (
                                <div
                                    key={calc.id}
                                    className="flex items-center justify-between rounded-lg bg-muted/50 p-3 text-sm"
                                >
                                    <div>
                                        <span className="font-medium">
                                            {CROP_OPTIONS.find((c) => c.value === calc.cropType)
                                                ?.label || calc.cropType}
                                        </span>
                                        <span className="ml-2 text-muted-foreground">
                      × {calc.numberOfPlants} plants
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="info">
                                            {calc.dailyLiters}L/day
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(calc.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Calculator Form */}
            <Card padding="lg">
                <CardContent>
                    <div className="space-y-5">
                        <Select
                            label="Crop Type"
                            options={CROP_OPTIONS}
                            value={formData.cropType}
                            onChange={(e) => handleChange("cropType", e.target.value)}
                        />

                        <Input
                            label="Number of Plants"
                            type="number"
                            value={formData.numberOfPlants}
                            onChange={(e) =>
                                handleChange("numberOfPlants", parseInt(e.target.value) || 1)
                            }
                            min={1}
                            max={1000}
                        />

                        <Select
                            label="Growth Stage"
                            options={GROWTH_STAGES}
                            value={formData.growthStage}
                            onChange={(e) => handleChange("growthStage", e.target.value)}
                        />

                        <Select
                            label="Water Availability"
                            options={WATER_LEVELS}
                            value={formData.waterAvailability}
                            onChange={(e) =>
                                handleChange("waterAvailability", e.target.value)
                            }
                        />

                        <Button
                            onClick={calculate}
                            loading={loading}
                            size="lg"
                            className="w-full"
                        >
                            <Calculator className="mr-2 h-5 w-5" />
              Calculate Water Needs
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Results */}
            {result && (
                <Card className="border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50 dark:border-cyan-800 dark:from-cyan-950 dark:to-blue-950">
                    <CardContent className="space-y-6">
                        {/* Main Results */}
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="rounded-xl bg-white/60 p-4 text-center dark:bg-black/20">
                                <Droplets className="mx-auto h-8 w-8 text-cyan-600" />
                                <p className="mt-2 text-3xl font-bold text-cyan-700 dark:text-cyan-300">
                                    {result.dailyLiters}L
                                </p>
                                <p className="text-sm text-cyan-600 dark:text-cyan-400">
                  Daily Need
                                </p>
                            </div>
                            <div className="rounded-xl bg-white/60 p-4 text-center dark:bg-black/20">
                                <Droplets className="mx-auto h-8 w-8 text-blue-600" />
                                <p className="mt-2 text-3xl font-bold text-blue-700 dark:text-blue-300">
                                    {result.weeklyLiters}L
                                </p>
                                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Weekly Total
                                </p>
                            </div>
                            <div className="rounded-xl bg-white/60 p-4 text-center dark:bg-black/20">
                                <Droplets className="mx-auto h-8 w-8 text-amber-600" />
                                <p className="mt-2 text-3xl font-bold text-amber-700 dark:text-amber-300">
                                    {result.survivalDailyLiters}L
                                </p>
                                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Survival Minimum
                                </p>
                            </div>
                        </div>

                        {/* Warnings */}
                        {result.warnings.length > 0 && (
                            <div className="space-y-2">
                                {result.warnings.map((warning, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start gap-2 rounded-lg bg-amber-100 p-3 text-sm text-amber-800 dark:bg-amber-900/50 dark:text-amber-200"
                                    >
                                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                        <span>{warning}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Save Button */}
                        <div className="flex justify-center">
                            <Button
                                variant="outline"
                                onClick={saveResult}
                                loading={saving}
                                disabled={!!result.id}
                            >
                                <Save className="mr-2 h-4 w-4" />
                                {result.id ? "Saved" : "Save Result"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Tips */}
            <Card>
                <CardContent>
                    <h3 className="mb-3 font-semibold">Water Saving Tips</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              Water early morning to reduce evaporation by up to 50%
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              Mulch around plants to retain soil moisture
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              Group plants with similar water needs together
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              Use drip irrigation or bottle irrigation for efficiency
                        </li>
                    </ul>
                </CardContent>
            </Card>

            <OfflineBadge />
        </div>
    );
}

export default function WaterCalculatorPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-[50vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            }
        >
            <WaterCalculatorContent />
        </Suspense>
    );
}
