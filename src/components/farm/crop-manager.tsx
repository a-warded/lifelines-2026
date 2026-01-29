"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { GrowthStage, getPlantOptions } from "@/lib/plants";
import { Leaf, PencilIcon, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

interface CropEntry {
    plantId: string;
    plantName: string;
    count: number;
    stage: GrowthStage;
    plantedDate?: string;
    notes?: string;
}

interface WaterResult {
    plantId: string;
    plantName: string;
    stage: GrowthStage;
    count: number;
    litersPerPlant: number;
    totalLiters: number;
}

interface WaterCalculation {
    entries: WaterResult[];
    totalDailyLiters: number;
    warning?: string;
    tips: string[];
}

interface CropManagerProps {
    crops: CropEntry[];
    waterCalculation?: WaterCalculation;
    onCropsChange: (crops: CropEntry[], save?: boolean) => void;
    saving?: boolean;
    compact?: boolean;
}

export function CropManager({
    crops,
    waterCalculation,
    onCropsChange,
    saving,
    compact = false,
}: CropManagerProps) {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.dir() === "rtl";
    const plantOptions = useMemo(() => getPlantOptions(), []);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [form, setForm] = useState<Partial<CropEntry>>({
        plantId: "",
        count: 1,
        stage: "seedling",
    });

    const GROWTH_STAGES_TRANSLATED = [
        { value: "seedling" as GrowthStage, label: t("crops.stages.seedling", "Seedling"), emoji: "🌱" },
        { value: "vegetative" as GrowthStage, label: t("crops.stages.vegetative", "Vegetative"), emoji: "🌿" },
        { value: "flowering" as GrowthStage, label: t("crops.stages.flowering", "Flowering"), emoji: "🌸" },
        { value: "fruiting" as GrowthStage, label: t("crops.stages.fruiting", "Fruiting"), emoji: "🍅" },
        { value: "mature" as GrowthStage, label: t("crops.stages.mature", "Mature"), emoji: "🌾" },
    ];

    const resetForm = () => {
        setForm({ plantId: "", count: 1, stage: "seedling" });
        setEditingIndex(null);
    };

    const handleAdd = () => {
        if (!form.plantId || !form.count || form.count < 1) return;

        const plant = plantOptions.find((p) => p.value === form.plantId);
        const newCrop: CropEntry = {
            plantId: form.plantId,
            plantName: plant?.label || form.plantId,
            count: form.count,
            stage: form.stage || "seedling",
            plantedDate: form.plantedDate,
            notes: form.notes,
        };

        if (editingIndex !== null) {
            const updated = [...crops];
            updated[editingIndex] = newCrop;
            onCropsChange(updated, true);
        } else {
            onCropsChange([...crops, newCrop], true);
        }

        setShowAddModal(false);
        resetForm();
    };

    const handleEdit = (index: number) => {
        const crop = crops[index];
        setForm({
            plantId: crop.plantId,
            count: crop.count,
            stage: crop.stage,
            plantedDate: crop.plantedDate,
            notes: crop.notes,
        });
        setEditingIndex(index);
        setShowAddModal(true);
    };

    const handleRemove = (index: number) => {
        const updated = crops.filter((_, i) => i !== index);
        onCropsChange(updated, true);
    };

    const handleStageChange = (index: number, stage: GrowthStage) => {
        const updated = [...crops];
        updated[index] = { ...updated[index], stage };
        onCropsChange(updated, true);
    };

    const getWaterForCrop = (plantId: string): WaterResult | undefined => {
        return waterCalculation?.entries.find((e) => e.plantId === plantId);
    };

    const getStageInfo = (stage: GrowthStage) => {
        return GROWTH_STAGES_TRANSLATED.find((s) => s.value === stage) || GROWTH_STAGES_TRANSLATED[0];
    };

    return (
        <div className="space-y-4">

            {/* Crops List */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Leaf className="h-5 w-5 text-green-600" />
                        {t("crops.title", "Your Crops")}
                    </CardTitle>
                    <Button size="sm" onClick={() => setShowAddModal(true)}>
                        <Plus className={`${isRTL ? "ms-1" : "me-1"} h-4 w-4`} />
                        {t("crops.addCrop", "Add Crop")}
                    </Button>
                </CardHeader>
                <CardContent>
                    {crops.length === 0 ? (
                        <div className="py-8 text-center">
                            <Leaf className="mx-auto h-12 w-12 text-muted-foreground/30" />
                            <p className="mt-2 text-muted-foreground">{t("crops.noCrops", "No crops added yet")}</p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-4"
                                onClick={() => setShowAddModal(true)}
                            >
                                <Plus className={`${isRTL ? "ms-1" : "me-1"} h-4 w-4`} />
                                {t("crops.addFirstCrop", "Add your first crop")}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {crops.map((crop, index) => {
                                const waterInfo = getWaterForCrop(crop.plantId);
                                const stageInfo = getStageInfo(crop.stage);

                                return (
                                    <div
                                        key={`${crop.plantId}-${index}`}
                                        className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-lg dark:bg-green-900">
                                            {stageInfo?.emoji || "🌱"}
                                        </div>

                                        <div className="flex flex-1 items-center justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-foreground">{crop.plantName}</span>
                                                    <Badge variant="secondary" className="text-xs">
                                                        x{crop.count}
                                                    </Badge>
                                                </div>
                                                <div className="mt-1">
                                                    <Select
                                                        value={crop.stage}
                                                        onChange={(e) => handleStageChange(index, e.target.value as GrowthStage)}
                                                        options={GROWTH_STAGES_TRANSLATED.map((s) => ({
                                                            value: s.value,
                                                            label: `${s.emoji} ${s.label}`,
                                                        }))}
                                                        className="h-10 text-sm"
                                                    />
                                                </div>
                                            </div>

                                            {waterInfo && (
                                                <span className="shrink-0 text-sm font-medium text-blue-600 dark:text-blue-400">
                                                    💧 {waterInfo.totalLiters.toFixed(2)}L/{t("common.day", "day")}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex shrink-0 items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(index)}
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemove(index)}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => {
                    setShowAddModal(false);
                    resetForm();
                }}
                title={editingIndex !== null ? t("crops.editCrop", "Edit Crop") : t("crops.addCrop", "Add Crop")}
            >
                <div className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium">{t("crops.plant", "Plant")}</label>
                        <Select
                            value={form.plantId || ""}
                            onChange={(e) => setForm({ ...form, plantId: e.target.value })}
                            options={[
                                { value: "", label: t("crops.selectPlant", "Select a plant...") },
                                ...plantOptions,
                            ]}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium">{t("crops.count", "Count")}</label>
                            <Input
                                type="number"
                                min={1}
                                value={form.count || 1}
                                onChange={(e) => setForm({ ...form, count: parseInt(e.target.value) || 1 })}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">{t("crops.growthStage", "Growth Stage")}</label>
                            <Select
                                value={form.stage || "seedling"}
                                onChange={(e) => setForm({ ...form, stage: e.target.value as GrowthStage })}
                                options={GROWTH_STAGES_TRANSLATED.map((s) => ({
                                    value: s.value,
                                    label: `${s.emoji} ${s.label}`,
                                }))}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">{t("crops.plantedDate", "Planted Date (optional)")}</label>
                        <Input
                            type="date"
                            value={form.plantedDate || ""}
                            onChange={(e) => setForm({ ...form, plantedDate: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowAddModal(false);
                                resetForm();
                            }}
                        >
                            {t("common.cancel", "Cancel")}
                        </Button>
                        <Button
                            onClick={handleAdd}
                            disabled={!form.plantId || !form.count || saving}
                        >
                            {saving ? t("common.saving", "Saving...") : editingIndex !== null ? t("common.update", "Update") : t("crops.addCrop", "Add Crop")}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
