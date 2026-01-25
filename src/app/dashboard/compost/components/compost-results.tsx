"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";
import { WASTE_TYPE_LABELS, type WasteType } from "@/lib/logic/compost-calculator";
import type { CompostResult, WasteFormEntry, TranslateFunction } from "../types";
import type { getCompostingMethod, estimateFertilizerValue } from "@/lib/logic/compost-calculator";

interface CompostResultsProps {
  result: CompostResult;
  method: ReturnType<typeof getCompostingMethod> | null;
  valueEstimate: ReturnType<typeof estimateFertilizerValue> | null;
  entries: WasteFormEntry[];
  t: TranslateFunction;
}

export function CompostResults({
  result,
  method,
  valueEstimate,
  entries,
  t,
}: CompostResultsProps) {
  if (!result || result.totalWasteKg <= 0) return null;

  return (
    <Card className="mt-6 overflow-hidden">
      {/* Header with yield info */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
        <div className="mb-1 text-sm font-medium opacity-90">
          {t("compost.results.yourYield", "Your Fertilizer Yield")}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold">{result.estimatedFertilizerKg}</span>
          <span className="text-xl">kg</span>
          <span className="ml-2 text-lg opacity-80">
            {t("compost.results.ofFertilizer", "of organic fertilizer")}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-4 text-sm opacity-90">
          <span>📦 {result.totalWasteKg} kg {t("compost.results.wasteInput", "waste input")}</span>
          <span>📊 {result.conversionRate}% {t("compost.results.conversion", "conversion")}</span>
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
        <NutrientBalance result={result} t={t} />

        {/* Breakdown */}
        <MaterialBreakdown result={result} t={t} />

        {/* Tips */}
        <CompostTips tips={result.tips} t={t} />

        {/* Composting Method */}
        {method && <CompostingMethod method={method} t={t} />}

        {/* CTA Buttons */}
        <ActionButtons result={result} entries={entries} t={t} />
      </CardContent>
    </Card>
  );
}

function NutrientBalance({ 
  result, 
  t 
}: { 
  result: CompostResult; 
  t: TranslateFunction;
}) {
  return (
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
  );
}

function MaterialBreakdown({ 
  result, 
  t 
}: { 
  result: CompostResult; 
  t: TranslateFunction;
}) {
  if (result.breakdown.length === 0) return null;

  return (
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
              <span className="ml-1 font-semibold text-emerald-600">
                {item.fertilizerKg} kg
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompostTips({ 
  tips, 
  t 
}: { 
  tips: string[]; 
  t: TranslateFunction;
}) {
  if (tips.length === 0) return null;

  return (
    <div className="mt-6 space-y-2">
      <h4 className="flex items-center gap-2 font-semibold">
        <Sparkles className="h-4 w-4 text-yellow-500" />
        {t("compost.results.tips", "Pro Tips")}
      </h4>
      <ul className="space-y-1">
        {tips.map((tip, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="mt-1 text-emerald-500">•</span>
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CompostingMethod({ 
  method, 
  t 
}: { 
  method: NonNullable<ReturnType<typeof getCompostingMethod>>; 
  t: TranslateFunction;
}) {
  return (
    <div className="mt-6 rounded-lg border-2 border-dashed border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
      <h4 className="mb-2 flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-400">
        <Leaf className="h-4 w-4" />
        {t("compost.results.recommendedMethod", "Recommended Method")}: {method.method}
      </h4>
      <p className="mb-3 text-sm text-muted-foreground">{method.description}</p>
      <div className="flex items-center gap-2 text-sm">
        <Badge
          variant={
            method.difficulty === "easy"
              ? "default"
              : method.difficulty === "medium"
                ? "secondary"
                : "outline"
          }
        >
          {method.difficulty === "easy"
            ? "🟢"
            : method.difficulty === "medium"
              ? "🟡"
              : "🔴"}{" "}
          {method.difficulty}
        </Badge>
      </div>
      <div className="mt-3 space-y-1">
        <p className="text-sm font-medium">
          {t("compost.results.requirements", "What you'll need")}:
        </p>
        <ul className="list-inside list-disc text-sm text-muted-foreground">
          {method.requirements.map((req, i) => (
            <li key={i}>{req}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ActionButtons({ 
  result, 
  entries,
  t,
}: { 
  result: CompostResult;
  entries: WasteFormEntry[];
  t: TranslateFunction;
}) {
  const wasteLabels = entries
    .filter((e) => e.wasteType)
    .map((e) => WASTE_TYPE_LABELS[e.wasteType as WasteType]?.label)
    .join(", ");

  const description = encodeURIComponent(
    `Home-made organic compost fertilizer. C:N ratio ${result.cnRatioBalanced ? "balanced" : "needs adjustment"}. Composting time: ${result.compostingDays} days. Made from ${wasteLabels}.`
  );

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <Link
        href={`/dashboard/exchange?type=fertilizer&mode=offering&title=${encodeURIComponent(`Organic Compost - ${result.estimatedFertilizerKg}kg`)}&quantity=${encodeURIComponent(`${result.estimatedFertilizerKg} kg`)}&description=${description}&dealType=donation&delivery=pickup`}
      >
        <Button>
          {t("compost.listFertilizer", "List Fertilizer for Exchange")}
        </Button>
      </Link>
      <Link href="/dashboard/map?layer=compost">
        <Button variant="outline">
          {t("compost.viewMap", "View Compost Sites Map")}
        </Button>
      </Link>
    </div>
  );
}
