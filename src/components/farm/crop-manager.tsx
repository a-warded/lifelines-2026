"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { GrowthStage, getPlantOptions } from "@/lib/plants";
import { Leaf, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

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

const GROWTH_STAGES: { value: GrowthStage; label: string; emoji: string }[] = [
    { value: "seedling", label: "Seedling", emoji: "🌱" },
    { value: "vegetative", label: "Vegetative", emoji: "🌿" },
    { value: "flowering", label: "Flowering", emoji: "🌸" },
    { value: "fruiting", label: "Fruiting", emoji: "🍅" },
    { value: "mature", label: "Mature", emoji: "🌾" },
];

export function CropManager({
    crops,
    waterCalculation,
    onCropsChange,
    saving,
    compact = false,
}: CropManagerProps) {
    const plantOptions = useMemo(() => getPlantOptions(), []);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [form, setForm] = useState<Partial<CropEntry>>({
        plantId: "",
        count: 1,
        stage: "seedling",
    });

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

    return (
        <div className="space-y-4">

            {/* Crops List */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Leaf className="h-5 w-5 text-green-600" />
                        Your Crops
                    </CardTitle>
                    <Button size="sm" onClick={() => setShowAddModal(true)}>
                        <Plus className="mr-1 h-4 w-4" />
                        Add Crop
                    </Button>
                </CardHeader>
                <CardContent>
                    {crops.length === 0 ? (
                        <div className="py-8 text-center">
                            <Leaf className="mx-auto h-12 w-12 text-muted-foreground/30" />
                            <p className="mt-2 text-muted-foreground">No crops added yet</p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-4"
                                onClick={() => setShowAddModal(true)}
                            >
                                <Plus className="mr-1 h-4 w-4" />
                                Add your first crop
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {crops.map((crop, index) => {
                                const waterInfo = getWaterForCrop(crop.plantId);
                                const stageInfo = GROWTH_STAGES.find((s) => s.value === crop.stage);

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
                                                        ×{crop.count}
                                                    </Badge>
                                                </div>
                                                <div className="mt-1">
                                                    <Select
                                                        value={crop.stage}
                                                        onChange={(e) => handleStageChange(index, e.target.value as GrowthStage)}
                                                        options={GROWTH_STAGES.map((s) => ({
                                                            value: s.value,
                                                            label: `${s.emoji} ${s.label}`,
                                                        }))}
                                                        className="h-8 text-sm"
                                                    />
                                                </div>
                                            </div>

                                            {waterInfo && (
                                                <span className="shrink-0 text-sm font-medium text-blue-600 dark:text-blue-400">
                                                    💧 {waterInfo.totalLiters.toFixed(1)}L/day
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex shrink-0 items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(index)}
                                            >
                                                Edit
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
                title={editingIndex !== null ? "Edit Crop" : "Add Crop"}
            >
                <div className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium">Plant</label>
                        <Select
                            value={form.plantId || ""}
                            onChange={(e) => setForm({ ...form, plantId: e.target.value })}
                            options={[
                                { value: "", label: "Select a plant..." },
                                ...plantOptions,
                            ]}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium">Count</label>
                            <Input
                                type="number"
                                min={1}
                                value={form.count || 1}
                                onChange={(e) => setForm({ ...form, count: parseInt(e.target.value) || 1 })}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Growth Stage</label>
                            <Select
                                value={form.stage || "seedling"}
                                onChange={(e) => setForm({ ...form, stage: e.target.value as GrowthStage })}
                                options={GROWTH_STAGES.map((s) => ({
                                    value: s.value,
                                    label: `${s.emoji} ${s.label}`,
                                }))}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Planted Date (optional)</label>
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
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAdd}
                            disabled={!form.plantId || !form.count || saving}
                        >
                            {saving ? "Saving..." : editingIndex !== null ? "Update" : "Add Crop"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
