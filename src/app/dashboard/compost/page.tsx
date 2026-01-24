"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LocationPickerMap } from "@/components/onboarding/location-picker-map";
import { getUserLocation } from "@/lib/geo";
import {
    calculateCompost,
    CompostResult,
    estimateFertilizerValue,
    getCompostingMethod,
    WasteEntry,
    WasteType,
    WASTE_TYPE_LABELS,
} from "@/lib/logic/compost-calculator";
import {
    ArrowRight,
    ExternalLink,
    Leaf,
    MapPin,
    Plus,
    Recycle,
    Sparkles,
    Trash2,
    TrendingUp,
    X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

interface WasteFormEntry {
    id: string;
    wasteType: WasteType | "";
    amountKg: number;
}

interface CompostSite {
    id: string;
    siteName: string;
    siteEmoji?: string;
    siteType: string;
    distance?: number;
    acceptsWaste: boolean;
    sellsFertilizer: boolean;
    locationLabel?: string;
}

export default function CompostPage() {
    const { t } = useTranslation();
    
    // Waste entries
    const [entries, setEntries] = useState<WasteFormEntry[]>([
        { id: "1", wasteType: "", amountKg: 0 },
    ]);
    
    // Calculation result
    const [result, setResult] = useState<CompostResult | null>(null);
    const [method, setMethod] = useState<ReturnType<typeof getCompostingMethod> | null>(null);
    const [valueEstimate, setValueEstimate] = useState<ReturnType<typeof estimateFertilizerValue> | null>(null);
    
    // Nearby composting sites
    const [nearbySites, setNearbySites] = useState<CompostSite[]>([]);
    const [loadingSites, setLoadingSites] = useState(false);
    
    // Add site modal
    const [showAddSiteModal, setShowAddSiteModal] = useState(false);
    const [addingSite, setAddingSite] = useState(false);
    const [siteForm, setSiteForm] = useState({
        siteName: "",
        siteType: "private" as "community" | "private" | "commercial" | "municipal",
        description: "",
        acceptsWaste: true,
        sellsFertilizer: false,
        capacityKg: "",
        contactInfo: "",
    });
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationLabel, setLocationLabel] = useState("");

    // Waste type options for select
    const wasteTypeOptions = useMemo(() => 
        Object.entries(WASTE_TYPE_LABELS).map(([value, data]) => ({
            value,
            label: `${data.emoji} ${data.label}`,
        })),
    []);

    // Calculate result whenever entries change
    const calculateResult = useCallback(() => {
        const validEntries: WasteEntry[] = entries
            .filter((e) => e.wasteType && e.amountKg > 0)
            .map((e) => ({
                wasteType: e.wasteType as WasteType,
                amountKg: e.amountKg,
            }));

        if (validEntries.length > 0) {
            const calcResult = calculateCompost(validEntries);
            setResult(calcResult);
            
            const hasManure = validEntries.some(e => e.wasteType === "manure");
            const methodResult = getCompostingMethod(calcResult.totalWasteKg, hasManure);
            setMethod(methodResult);
            
            const value = estimateFertilizerValue(calcResult.estimatedFertilizerKg);
            setValueEstimate(value);
        } else {
            setResult(null);
            setMethod(null);
            setValueEstimate(null);
        }
    }, [entries]);

    useEffect(() => {
        calculateResult();
    }, [calculateResult]);

    // Fetch nearby compost sites
    useEffect(() => {
        const fetchNearbySites = async () => {
            setLoadingSites(true);
            try {
                const location = await getUserLocation();
                setUserLocation({ lat: location.latitude, lng: location.longitude });
                setLocationLabel(location.locationLabel || "");
                
                const res = await fetch(`/api/compost?lat=${location.latitude}&lon=${location.longitude}`);
                if (res.ok) {
                    const data = await res.json();
                    setNearbySites(data.sites || []);
                }
            } catch (error) {
                console.error("Failed to fetch compost sites:", error);
            } finally {
                setLoadingSites(false);
            }
        };
        
        fetchNearbySites();
    }, []);

    const addEntry = () => {
        setEntries([
            ...entries,
            { id: Date.now().toString(), wasteType: "", amountKg: 0 },
        ]);
    };

    const removeEntry = (id: string) => {
        if (entries.length > 1) {
            setEntries(entries.filter((e) => e.id !== id));
        }
    };

    const updateEntry = (id: string, field: keyof WasteFormEntry, value: string | number) => {
        setEntries(
            entries.map((e) =>
                e.id === id ? { ...e, [field]: value } : e
            )
        );
    };

    const handleAddSite = async () => {
        if (!siteForm.siteName || !userLocation) return;
        
        setAddingSite(true);
        try {
            const res = await fetch("/api/compost", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...siteForm,
                    capacityKg: siteForm.capacityKg ? parseInt(siteForm.capacityKg) : undefined,
                    latitude: userLocation.lat,
                    longitude: userLocation.lng,
                    locationLabel,
                }),
            });

            if (res.ok) {
                setShowAddSiteModal(false);
                setSiteForm({
                    siteName: "",
                    siteType: "private",
                    description: "",
                    acceptsWaste: true,
                    sellsFertilizer: false,
                    capacityKg: "",
                    contactInfo: "",
                });
                // Refresh sites
                const sitesRes = await fetch(`/api/compost?lat=${userLocation.lat}&lon=${userLocation.lng}`);
                if (sitesRes.ok) {
                    const data = await sitesRes.json();
                    setNearbySites(data.sites || []);
                }
            }
        } catch (error) {
            console.error("Failed to add site:", error);
        } finally {
            setAddingSite(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 p-8 text-white">
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                
                <div className="relative z-10">
                    <div className="mb-2 flex items-center gap-2">
                        <Recycle className="h-6 w-6" />
                        <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                            {t("compost.badge", "Circular Economy")}
                        </Badge>
                    </div>
                    <h1 className="mb-2 text-3xl font-bold">
                        {t("compost.title", "Turn Waste into Gold")} ✨
                    </h1>
                    <p className="max-w-xl text-white/90">
                        {t("compost.subtitle", "Transform your agricultural waste into nutrient-rich organic fertilizer. Save money, reduce waste, and grow healthier crops.")}
                    </p>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Calculator Section */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <span className="text-2xl">🌱</span>
                                {t("compost.calculator.title", "What waste do you have?")}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                {t("compost.calculator.subtitle", "Add your excess agricultural waste and we'll calculate your fertilizer potential")}
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {entries.map((entry, index) => (
                                <div
                                    key={entry.id}
                                    className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-end"
                                >
                                    <div className="flex-1 space-y-2">
                                        <label className="text-sm font-medium">
                                            {t("compost.wasteType", "Waste Type")}
                                        </label>
                                        <Select
                                            value={entry.wasteType}
                                            onChange={(e) => updateEntry(entry.id, "wasteType", e.target.value)}
                                            options={[
                                                { value: "", label: t("compost.selectWaste", "Select waste type...") },
                                                ...wasteTypeOptions,
                                            ]}
                                        />
                                        {entry.wasteType && (
                                            <p className="text-xs text-muted-foreground">
                                                {WASTE_TYPE_LABELS[entry.wasteType as WasteType]?.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="w-full space-y-2 sm:w-32">
                                        <label className="text-sm font-medium">
                                            {t("compost.amount", "Amount (kg)")}
                                        </label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.5"
                                            value={entry.amountKg || ""}
                                            onChange={(e) => updateEntry(entry.id, "amountKg", parseFloat(e.target.value) || 0)}
                                            placeholder="0"
                                        />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeEntry(entry.id)}
                                        disabled={entries.length === 1}
                                        className="text-muted-foreground hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}

                            <Button
                                variant="outline"
                                onClick={addEntry}
                                className="w-full border-dashed"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                {t("compost.addMore", "Add More Waste")}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Results */}
                    {result && result.totalWasteKg > 0 && (
                        <Card className="mt-6 overflow-hidden">
                            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
                                <div className="mb-1 text-sm font-medium opacity-90">
                                    {t("compost.results.yourYield", "Your Fertilizer Yield")}
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold">
                                        {result.estimatedFertilizerKg}
                                    </span>
                                    <span className="text-xl">kg</span>
                                    <span className="ml-2 text-lg opacity-80">
                                        {t("compost.results.ofFertilizer", "of organic fertilizer")}
                                    </span>
                                </div>
                                <div className="mt-2 flex items-center gap-4 text-sm opacity-90">
                                    <span>
                                        📦 {result.totalWasteKg} kg {t("compost.results.wasteInput", "waste input")}
                                    </span>
                                    <span>
                                        📊 {result.conversionRate}% {t("compost.results.conversion", "conversion")}
                                    </span>
                                </div>
                            </div>

                            <CardContent className="p-6">
                                <div className="grid gap-6 sm:grid-cols-2">
                                    {/* Timeline */}
                                    <div className="space-y-2">
                                        <h4 className="flex items-center gap-2 font-semibold">
                                            <span>⏱️</span>
                                            {t("compost.results.timeline", "Processing Time")}
                                        </h4>
                                        <p className="text-2xl font-bold text-primary">
                                            ~{result.compostingDays} {t("common.day", "days")}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {t("compost.results.timelineNote", "With proper turning and moisture")}
                                        </p>
                                    </div>

                                    {/* Value Estimate */}
                                    {valueEstimate && (
                                        <div className="space-y-2">
                                            <h4 className="flex items-center gap-2 font-semibold">
                                                <TrendingUp className="h-4 w-4" />
                                                {t("compost.results.estimatedValue", "Estimated Value")}
                                            </h4>
                                            <p className="text-2xl font-bold text-emerald-600">
                                                ${valueEstimate.lowEstimate} - ${valueEstimate.highEstimate}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {t("compost.results.valueNote", "If sold as organic compost")}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Nutrient Balance */}
                                <div className="mt-6 rounded-lg bg-muted/50 p-4">
                                    <h4 className="mb-3 font-semibold">
                                        {t("compost.results.nutrientBalance", "Nutrient Balance")}
                                    </h4>
                                    <div className="flex flex-wrap gap-3">
                                        <Badge variant={result.cnRatioBalanced ? "default" : "secondary"}>
                                            {result.cnRatioBalanced ? "✓" : "!"} C:N Ratio
                                        </Badge>
                                        <Badge variant={result.nitrogenContent === "high" ? "default" : "secondary"}>
                                            🌿 Nitrogen: {result.nitrogenContent}
                                        </Badge>
                                        <Badge variant={result.carbonContent === "high" ? "default" : "secondary"}>
                                            🍂 Carbon: {result.carbonContent}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Breakdown */}
                                {result.breakdown.length > 0 && (
                                    <div className="mt-6">
                                        <h4 className="mb-3 font-semibold">
                                            {t("compost.results.breakdown", "Breakdown by Material")}
                                        </h4>
                                        <div className="space-y-2">
                                            {result.breakdown.map((item, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-center justify-between rounded-lg border p-3"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span>{WASTE_TYPE_LABELS[item.wasteType].emoji}</span>
                                                        <span>{WASTE_TYPE_LABELS[item.wasteType].label}</span>
                                                        <Badge variant="outline" className="text-xs">
                                                            {item.category === "green" ? "🌿 Green" : "🍂 Brown"}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-right text-sm">
                                                        <span className="text-muted-foreground">{item.amountKg} kg →</span>
                                                        <span className="ml-1 font-semibold text-emerald-600">{item.fertilizerKg} kg</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Tips */}
                                {result.tips.length > 0 && (
                                    <div className="mt-6 space-y-2">
                                        <h4 className="flex items-center gap-2 font-semibold">
                                            <Sparkles className="h-4 w-4 text-yellow-500" />
                                            {t("compost.results.tips", "Pro Tips")}
                                        </h4>
                                        <ul className="space-y-1">
                                            {result.tips.map((tip, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                    <span className="mt-1 text-emerald-500">•</span>
                                                    {tip}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Composting Method */}
                                {method && (
                                    <div className="mt-6 rounded-lg border-2 border-dashed border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
                                        <h4 className="mb-2 flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-400">
                                            <Leaf className="h-4 w-4" />
                                            {t("compost.results.recommendedMethod", "Recommended Method")}: {method.method}
                                        </h4>
                                        <p className="mb-3 text-sm text-muted-foreground">
                                            {method.description}
                                        </p>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Badge variant={method.difficulty === "easy" ? "default" : method.difficulty === "medium" ? "secondary" : "outline"}>
                                                {method.difficulty === "easy" ? "🟢" : method.difficulty === "medium" ? "🟡" : "🔴"} {method.difficulty}
                                            </Badge>
                                        </div>
                                        <div className="mt-3 space-y-1">
                                            <p className="text-sm font-medium">{t("compost.results.requirements", "What you'll need")}:</p>
                                            <ul className="list-inside list-disc text-sm text-muted-foreground">
                                                {method.requirements.map((req, i) => (
                                                    <li key={i}>{req}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                {/* CTA Buttons */}
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <Link href={`/dashboard/exchange?type=fertilizer&mode=offering&title=${encodeURIComponent(`Organic Compost - ${result.estimatedFertilizerKg}kg`)}&quantity=${encodeURIComponent(`${result.estimatedFertilizerKg} kg`)}&description=${encodeURIComponent(`Home-made organic compost fertilizer. C:N ratio ${result.cnRatioBalanced ? "balanced" : "needs adjustment"}. Composting time: ${result.compostingDays} days. Made from ${entries.filter(e => e.wasteType).map(e => WASTE_TYPE_LABELS[e.wasteType as WasteType]?.label).join(", ")}.`)}&dealType=donation&delivery=pickup`}>
                                        <Button>
                                            <Recycle className="mr-2 h-4 w-4" />
                                            {t("compost.listFertilizer", "List Fertilizer for Exchange")}
                                        </Button>
                                    </Link>
                                    <Link href="/dashboard/map?layer=compost">
                                        <Button variant="outline">
                                            <MapPin className="mr-2 h-4 w-4" />
                                            {t("compost.viewMap", "View Compost Sites Map")}
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Nearby Compost Sites */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center justify-between text-lg">
                                <span className="flex items-center gap-2">
                                    <span>♻️</span>
                                    {t("compost.nearbySites", "Nearby Compost Sites")}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowAddSiteModal(true)}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loadingSites ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                </div>
                            ) : nearbySites.length > 0 ? (
                                <div className="space-y-3">
                                    {nearbySites.map((site) => (
                                        <div
                                            key={site.id}
                                            className="rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                        >
                                            <div className="flex items-start gap-2">
                                                <span className="text-xl">{site.siteEmoji || "♻️"}</span>
                                                <div className="flex-1">
                                                    <h4 className="font-medium">{site.siteName}</h4>
                                                    <p className="text-xs text-muted-foreground">
                                                        {site.locationLabel || site.siteType}
                                                    </p>
                                                    <div className="mt-1 flex flex-wrap gap-1">
                                                        {site.acceptsWaste && (
                                                            <Badge variant="outline" className="text-xs">
                                                                📥 Accepts waste
                                                            </Badge>
                                                        )}
                                                        {site.sellsFertilizer && (
                                                            <Badge variant="outline" className="text-xs">
                                                                🌱 Has fertilizer
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                {site.distance !== undefined && (
                                                    <span className="text-sm text-muted-foreground">
                                                        {site.distance.toFixed(1)} km
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    <Link href="/dashboard/map?layer=compost">
                                        <Button variant="outline" className="w-full">
                                            {t("compost.viewAllSites", "View All on Map")}
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="py-6 text-center">
                                    <p className="mb-3 text-sm text-muted-foreground">
                                        {t("compost.noNearbySites", "No composting sites nearby yet")}
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowAddSiteModal(true)}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        {t("compost.addSite", "Add Your Site")}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Info Card */}
                    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
                        <CardContent className="p-4">
                            <h3 className="mb-2 flex items-center gap-2 font-semibold">
                                <span>💡</span>
                                {t("compost.quickTips.title", "Did You Know?")}
                            </h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <span>🌍</span>
                                    {t("compost.quickTips.tip1", "Composting reduces methane emissions from landfills by up to 50%")}
                                </li>
                                <li className="flex items-start gap-2">
                                    <span>💰</span>
                                    {t("compost.quickTips.tip2", "Organic fertilizer can cost 2-3x more than homemade compost")}
                                </li>
                                <li className="flex items-start gap-2">
                                    <span>🌱</span>
                                    {t("compost.quickTips.tip3", "Compost improves soil water retention by up to 20%")}
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Exchange Link */}
                    <Card>
                        <CardContent className="p-4">
                            <h3 className="mb-2 flex items-center gap-2 font-semibold">
                                <Recycle className="h-4 w-4" />
                                {t("compost.exchange.title", "Exchange Fertilizer")}
                            </h3>
                            <p className="mb-3 text-sm text-muted-foreground">
                                {t("compost.exchange.description", "Have extra compost? Share it with your community or trade for seeds and produce.")}
                            </p>
                            <Link href="/dashboard/exchange?type=fertilizer">
                                <Button variant="outline" className="w-full">
                                    {t("compost.exchange.viewListings", "View Fertilizer Listings")}
                                    <ExternalLink className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Add Compost Site Modal */}
            <Modal
                isOpen={showAddSiteModal}
                onClose={() => setShowAddSiteModal(false)}
                title={t("compost.addSiteModal.title", "Add Composting Site")}
            >
                <div className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium">
                            {t("compost.addSiteModal.siteName", "Site Name")} *
                        </label>
                        <Input
                            value={siteForm.siteName}
                            onChange={(e) => setSiteForm({ ...siteForm, siteName: e.target.value })}
                            placeholder={t("compost.addSiteModal.siteNamePlaceholder", "e.g., Community Garden Compost")}
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium">
                            {t("compost.addSiteModal.siteType", "Site Type")} *
                        </label>
                        <Select
                            value={siteForm.siteType}
                            onChange={(e) => setSiteForm({ ...siteForm, siteType: e.target.value as typeof siteForm.siteType })}
                            options={[
                                { value: "private", label: "🏠 Private (Your property)" },
                                { value: "community", label: "👥 Community (Shared space)" },
                                { value: "commercial", label: "🏢 Commercial (Business)" },
                                { value: "municipal", label: "🏛️ Municipal (City-run)" },
                            ]}
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium">
                            {t("compost.addSiteModal.description", "Description")}
                        </label>
                        <Textarea
                            value={siteForm.description}
                            onChange={(e) => setSiteForm({ ...siteForm, description: e.target.value })}
                            placeholder={t("compost.addSiteModal.descriptionPlaceholder", "What kind of waste do you accept? Any special instructions?")}
                            rows={2}
                        />
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={siteForm.acceptsWaste}
                                onChange={(e) => setSiteForm({ ...siteForm, acceptsWaste: e.target.checked })}
                                className="rounded"
                            />
                            <span className="text-sm">{t("compost.addSiteModal.acceptsWaste", "Accept waste from others")}</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={siteForm.sellsFertilizer}
                                onChange={(e) => setSiteForm({ ...siteForm, sellsFertilizer: e.target.checked })}
                                className="rounded"
                            />
                            <span className="text-sm">{t("compost.addSiteModal.sellsFertilizer", "Have fertilizer available")}</span>
                        </label>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium">
                            {t("compost.addSiteModal.capacity", "Capacity (kg)")}
                        </label>
                        <Input
                            type="number"
                            value={siteForm.capacityKg}
                            onChange={(e) => setSiteForm({ ...siteForm, capacityKg: e.target.value })}
                            placeholder={t("compost.addSiteModal.capacityPlaceholder", "e.g., 500")}
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium">
                            {t("compost.addSiteModal.contact", "Contact Info")}
                        </label>
                        <Input
                            value={siteForm.contactInfo}
                            onChange={(e) => setSiteForm({ ...siteForm, contactInfo: e.target.value })}
                            placeholder={t("compost.addSiteModal.contactPlaceholder", "Phone or email (optional)")}
                        />
                    </div>

                    {/* Location Section with Mini Map */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium">
                            {t("compost.addSiteModal.location", "Location")} *
                        </label>
                        <p className="text-xs text-muted-foreground">
                            Click on the map to set the composting site location
                        </p>
                        
                        <div className="rounded-lg overflow-hidden border border-border">
                            <LocationPickerMap
                                latitude={userLocation?.lat}
                                longitude={userLocation?.lng}
                                onLocationSelect={(lat, lng, label) => {
                                    setUserLocation({ lat, lng });
                                    if (label) setLocationLabel(label);
                                }}
                                height="200px"
                            />
                        </div>
                        
                        {userLocation && (
                            <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2 text-sm">
                                <MapPin className="h-4 w-4 text-primary" />
                                <span className="text-muted-foreground text-xs truncate">
                                    {locationLabel || `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="outline" onClick={() => setShowAddSiteModal(false)}>
                            {t("common.cancel", "Cancel")}
                        </Button>
                        <Button
                            onClick={handleAddSite}
                            disabled={!siteForm.siteName || !userLocation || addingSite}
                        >
                            {addingSite ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t("compost.addSiteModal.submit", "Add Site")}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
