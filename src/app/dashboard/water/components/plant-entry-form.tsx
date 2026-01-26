"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { GROWTH_STAGES, type GrowthStage } from "@/lib/logic/water-calculator";
import type { PlantEntry, TranslateFunction } from "../types";

interface PlantEntryFormProps {
  entries: PlantEntry[];
  plantOptions: { value: string; label: string }[];
  onAddEntry: () => void;
  onRemoveEntry: (id: string) => void;
  onUpdateEntry: (id: string, field: keyof PlantEntry, value: string | number) => void;
  onSave: () => void;
  onClear: () => void;
  hasResult: boolean;
  t: TranslateFunction;
}

export function PlantEntryForm({
    entries,
    plantOptions,
    onAddEntry,
    onRemoveEntry,
    onUpdateEntry,
    onSave,
    onClear,
    hasResult,
    t,
}: PlantEntryFormProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>{t("water.title", "Water Calculator")}</span>
                    <Button size="sm" onClick={onAddEntry}>
            + {t("water.addPlant", "Add Plant")}
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {entries.map((entry, index) => (
                    <PlantEntryRow
                        key={entry.id}
                        entry={entry}
                        index={index}
                        plantOptions={plantOptions}
                        canRemove={entries.length > 1}
                        onUpdate={(field, value) => onUpdateEntry(entry.id, field, value)}
                        onRemove={() => onRemoveEntry(entry.id)}
                        t={t}
                    />
                ))}

                <div className="flex gap-2 pt-2">
                    <Button
                        variant="secondary"
                        onClick={onSave}
                        disabled={!hasResult}
                        className="flex-1"
                    >
                        {t("water.actions.save", "Save Calculation")}
                    </Button>
                    <Button variant="ghost" onClick={onClear} className="flex-1">
                        {t("water.actions.clear", "Clear All")}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

interface PlantEntryRowProps {
  entry: PlantEntry;
  index: number;
  plantOptions: { value: string; label: string }[];
  canRemove: boolean;
  onUpdate: (field: keyof PlantEntry, value: string | number) => void;
  onRemove: () => void;
  t: TranslateFunction;
}

function PlantEntryRow({
    entry,
    index,
    plantOptions,
    canRemove,
    onUpdate,
    onRemove,
    t,
}: PlantEntryRowProps) {
    return (
        <div className="p-4 border border-border rounded-lg space-y-3">
            <div className="flex justify-between items-center">
                <span className="font-medium text-sm">
                    {t("water.plantLabel", "Plant")} {index + 1}
                </span>
                {canRemove && (
                    <button
                        onClick={onRemove}
                        className="text-red-500 text-sm hover:underline"
                    >
                        {t("water.removePlant", "Remove")}
                    </button>
                )}
            </div>

            <Select
                value={entry.plantId}
                onChange={(e) => onUpdate("plantId", e.target.value)}
                options={[
                    { value: "", label: t("water.selectPlant", "Select a plant...") },
                    ...plantOptions,
                ]}
            />

            <div className="grid grid-cols-2 gap-3">
                <Select
                    label={t("water.stageLabel", "Growth Stage")}
                    value={entry.stage}
                    onChange={(e) => onUpdate("stage", e.target.value as GrowthStage)}
                    options={GROWTH_STAGES.map((s) => ({
                        value: s.value,
                        label: t(`water.stages.${s.value}`, s.value),
                    }))}
                />

                <Input
                    type="number"
                    label={t("water.countLabel", "Count")}
                    min={1}
                    max={1000}
                    value={entry.count}
                    onChange={(e) => onUpdate("count", parseInt(e.target.value) || 1)}
                />
            </div>
        </div>
    );
}
