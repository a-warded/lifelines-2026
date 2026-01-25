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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🌱</span>
          {t("compost.calculator.title", "What waste do you have?")}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t(
            "compost.calculator.subtitle",
            "Add your excess agricultural waste and we'll calculate your fertilizer potential"
          )}
        </p>
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

        <Button variant="outline" onClick={onAddEntry} className="w-full border-dashed">
          <Plus className="mr-2 h-4 w-4" />
          {t("compost.addMore", "Add More Waste")}
        </Button>
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
    <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-end">
      <div className="flex-1 space-y-2">
        <label className="text-sm font-medium">
          {t("compost.wasteType", "Waste Type")}
        </label>
        <Select
          value={entry.wasteType}
          onChange={(e) => onUpdate("wasteType", e.target.value)}
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
