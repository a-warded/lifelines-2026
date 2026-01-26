"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { WASTE_TYPE_LABELS, type WasteType } from "@/lib/logic/compost-calculator";
import type { WasteFormEntry, TranslateFunction } from "../types";

interface WasteCalculatorProps {
  entries: WasteFormEntry[];
  wasteTypeOptions: { value: string; label: string }[];
  onAddEntry: () => void;
  onRemoveEntry: (id: string) => void;
  onUpdateEntry: (id: string, field: keyof WasteFormEntry, value: string | number) => void;
  t: TranslateFunction;
}

export function WasteCalculator({
    entries,
    wasteTypeOptions,
    onAddEntry,
    onRemoveEntry,
    onUpdateEntry,
    t,
}: WasteCalculatorProps) {
    const totalWeight = entries.reduce((sum, e) => sum + (e.amountKg || 0), 0);
    const hasSmallBatch = totalWeight > 0 && totalWeight < 10;

    return (
        <Card className="border-border/50">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-foreground">
                    {t("compost.calculator.title", "What do you have?")}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {entries.map((entry) => (
                    <WasteEntryRow
                        key={entry.id}
                        entry={entry}
                        wasteTypeOptions={wasteTypeOptions}
                        canRemove={entries.length > 1}
                        onUpdate={(field, value) => onUpdateEntry(entry.id, field, value)}
                        onRemove={() => onRemoveEntry(entry.id)}
                        t={t}
                    />
                ))}

                <Button variant="ghost" onClick={onAddEntry} className="w-full text-muted-foreground hover:text-foreground">
                    <Plus className="mr-2 h-4 w-4" />
                    {t("compost.addMore", "Add another type")}
                </Button>

                {/* Friction for small batches */}
                {hasSmallBatch && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50/50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/20">
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                            {totalWeight < 5 
                                ? "This is quite small. Composting works better with larger batches (15kg+)."
                                : "Most users wait until they have ≥15 kg. Continue anyway?"
                            }
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

interface WasteEntryRowProps {
  entry: WasteFormEntry;
  wasteTypeOptions: { value: string; label: string }[];
  canRemove: boolean;
  onUpdate: (field: keyof WasteFormEntry, value: string | number) => void;
  onRemove: () => void;
  t: TranslateFunction;
}

function WasteEntryRow({
    entry,
    wasteTypeOptions,
    canRemove,
    onUpdate,
    onRemove,
    t,
}: WasteEntryRowProps) {
    return (
        <div className="flex flex-col gap-3 rounded-lg border border-border/50 bg-background p-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                    {t("compost.wasteType", "Type")}
                </label>
                <Select
                    value={entry.wasteType}
                    onChange={(e) => onUpdate("wasteType", e.target.value)}
                    options={[
                        { value: "", label: t("compost.selectWaste", "Select type...") },
                        ...wasteTypeOptions,
                    ]}
                />
            </div>
            <div className="w-full space-y-1.5 sm:w-28">
                <label className="text-sm font-medium text-foreground">
                    {t("compost.amount", "kg")}
                </label>
                <Input
                    type="number"
                    min="0"
                    step="0.5"
                    value={entry.amountKg || ""}
                    onChange={(e) => onUpdate("amountKg", parseFloat(e.target.value) || 0)}
                    placeholder="0"
                />
            </div>
            <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                disabled={!canRemove}
                className="text-muted-foreground hover:text-destructive"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
}
