"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
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

// Generate a single-line verdict (the advisor moment) - returns translation keys
function getVerdictKeys(
  result: CompostResult,
  valueEstimate: ReturnType<typeof estimateFertilizerValue> | null
): string[] {
  const parts: string[] = [];
  
  // Worth composting?
  if (result.totalWasteKg < 10) {
    parts.push("compost.results.smallBatch");
  } else {
    parts.push("compost.results.worthComposting");
  }
  
  // Balance advice
  if (result.carbonContent === "high" && result.nitrogenContent === "low") {
    parts.push("compost.results.addGreens");
  } else if (result.nitrogenContent === "high" && result.carbonContent === "low") {
    parts.push("compost.results.addBrowns");
  }
  
  // Sell advice
  if (valueEstimate && valueEstimate.highEstimate < 20) {
    parts.push("compost.results.useYourself");
  } else if (valueEstimate && result.estimatedFertilizerKg >= 10 && result.cnRatioBalanced) {
    parts.push("compost.results.sellable");
  } else if (valueEstimate && result.estimatedFertilizerKg >= 5) {
    parts.push("compost.results.dontSellUnlessMixed");
  }
  
  return parts;
}

// Generate context-aware headline based on inputs - now returns translation params
function getContextHeadlineParams(entries: WasteFormEntry[], result: CompostResult): { key: string; wasteType?: string } {
  const primaryWaste = entries
    .filter((e) => e.wasteType && e.amountKg > 0)
    .sort((a, b) => b.amountKg - a.amountKg)[0];
  
  if (primaryWaste && primaryWaste.amountKg >= 5) {
    return { 
      key: "compost.results.headline",
      wasteType: primaryWaste.wasteType as string
    };
  }
  
  return { key: "compost.results.headlineGeneric" };
}

// Generate warnings for feasibility section - returns translation keys
function getFailureRiskKeys(result: CompostResult): string[] {
  const risks: string[] = [];
  
  if (result.carbonContent === "high" && result.nitrogenContent === "low") {
    risks.push("compost.results.tooMuchCarbon");
  }
  if (result.nitrogenContent === "high" && result.carbonContent === "low") {
    risks.push("compost.results.tooMuchNitrogen");
  }
  if (result.totalWasteKg < 15) {
    risks.push("compost.results.smallPileHeat");
  }
  if (result.compostingDays > 90) {
    risks.push("compost.results.longProcessing");
  }
  
  return risks;
}

export function CompostResults({
  result,
  method,
  valueEstimate,
  entries,
  t,
}: CompostResultsProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!result || result.totalWasteKg <= 0) return null;

  const verdictKeys = getVerdictKeys(result, valueEstimate);
  const headlineParams = getContextHeadlineParams(entries, result);
  const failureRiskKeys = getFailureRiskKeys(result);
  const worthExchanging = result.estimatedFertilizerKg >= 5;
  
  // Get waste type label for headline
  const primaryWaste = entries
    .filter((e) => e.wasteType && e.amountKg > 0)
    .sort((a, b) => b.amountKg - a.amountKg)[0];
  const wasteTypeLabel = primaryWaste 
    ? WASTE_TYPE_LABELS[primaryWaste.wasteType as WasteType]?.label.toLowerCase() || "waste"
    : "waste";
  
  // Calculate confident price estimate (midpoint, rounded)
  const priceEstimate = valueEstimate 
    ? Math.round((valueEstimate.lowEstimate + valueEstimate.highEstimate) / 2 / 5) * 5
    : null;

  const toggleExpand = (section: string) => {
    setExpanded(expanded === section ? null : section);
  };

  return (
    <div className="mt-6 space-y-6">
      {/* ═══════════════════════════════════════════════════════════════
          PHASE 1: RESULT
          The ONE loud moment + verdict
      ═══════════════════════════════════════════════════════════════ */}
      <div className="space-y-3">
        {/* Context-aware headline */}
        <p className="text-sm text-muted-foreground">
          {t(headlineParams.key, { amount: result.totalWasteKg, wasteType: wasteTypeLabel })}
        </p>
        
        {/* Primary Result */}
        <div className="rounded-xl border-2 border-foreground/10 bg-background p-6">
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-bold tracking-tight text-foreground">
              {result.estimatedFertilizerKg}
            </span>
            <span className="text-2xl font-medium text-muted-foreground">kg</span>
          </div>
          
          {/* Verdict - the advisor moment */}
          <div className="mt-3 pt-3 border-t border-border/50">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("compost.results.verdict")}: </span>
            <span className="text-sm text-foreground">{verdictKeys.map(key => t(key)).join(" ")}</span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          PHASE 2: FEASIBILITY
          Time + what could go wrong
      ═══════════════════════════════════════════════════════════════ */}
      <div className="space-y-1 border-l-2 border-border/30 pl-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          {t("compost.results.feasibility")}
        </div>
        
        {/* Timeline - always visible, not expandable */}
        <div className="flex items-baseline justify-between py-2">
          <span className="text-sm text-muted-foreground">{t("compost.results.timeToReady")}</span>
          <span className="text-sm font-medium text-foreground">{t("compost.results.days", { days: result.compostingDays })}</span>
        </div>
        
        {/* Value - confident estimate */}
        {priceEstimate && priceEstimate > 0 && (
          <div className="flex items-baseline justify-between py-2">
            <span className="text-sm text-muted-foreground">{t("compost.results.marketValue")}</span>
            <span className="text-sm font-medium text-foreground">
              {priceEstimate < 20 ? t("compost.results.notWorthSelling") : `~$${priceEstimate}`}
            </span>
          </div>
        )}

        {/* Failure risks - sharper framing */}
        {failureRiskKeys.length > 0 && (
          <ExpandableSection
            title={t("compost.results.whyMightFail")}
            isOpen={expanded === "risks"}
            onToggle={() => toggleExpand("risks")}
          >
            <ul className="space-y-2 text-sm">
              {failureRiskKeys.map((riskKey, i) => (
                <li key={i} className="text-muted-foreground">
                  {t(riskKey)}
                </li>
              ))}
            </ul>
          </ExpandableSection>
        )}

        {/* Breakdown - tucked away */}
        {result.breakdown.length > 1 && (
          <ExpandableSection
            title={t("compost.results.materialBreakdown")}
            isOpen={expanded === "breakdown"}
            onToggle={() => toggleExpand("breakdown")}
          >
            <div className="space-y-2">
              {result.breakdown.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm py-1.5 border-b border-border/50 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{WASTE_TYPE_LABELS[item.wasteType].label}</span>
                    <span className="text-xs text-muted-foreground/70">
                      {item.category === "green" ? t("compost.results.nitrogen") : t("compost.results.carbon")}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">{item.amountKg}kg →</span>
                    <span className="ml-1 font-medium text-foreground">{item.fertilizerKg}kg</span>
                  </div>
                </div>
              ))}
            </div>
          </ExpandableSection>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          PHASE 3: ACTION
          Exchange CTA with qualifying context
      ═══════════════════════════════════════════════════════════════ */}
      <div className="space-y-3">
        {/* Qualifying context - earn the click */}
        {worthExchanging && (
          <p className="text-xs text-muted-foreground">
            {result.estimatedFertilizerKg >= 10 
              ? t("compost.results.meetsMinimum")
              : t("compost.results.enoughVolume")
            }
          </p>
        )}
        
        <div className="flex flex-wrap gap-3">
          <ActionButtons result={result} entries={entries} t={t} />
        </div>
      </div>
    </div>
  );
}

function ExpandableSection({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border/50 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3 text-sm text-left hover:text-foreground transition-colors text-muted-foreground"
      >
        <span>{title}</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
      {isOpen && <div className="pb-4">{children}</div>}
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
    `Home-made organic compost. C:N ratio ${result.cnRatioBalanced ? "balanced" : "needs adjustment"}. Composting time: ${result.compostingDays} days. Made from ${wasteLabels}.`
  );

  // Only show exchange if it's worth it
  const worthExchanging = result.estimatedFertilizerKg >= 5;

  return (
    <>
      {worthExchanging ? (
        <Link
          href={`/dashboard/exchange?type=fertilizer&mode=offering&title=${encodeURIComponent(`Organic Compost - ${result.estimatedFertilizerKg}kg`)}&quantity=${encodeURIComponent(`${result.estimatedFertilizerKg} kg`)}&description=${description}&dealType=donation&delivery=pickup`}
        >
          <Button variant="primary" className="bg-foreground text-background hover:bg-foreground/90">
            {t("compost.listFertilizer", "List for Exchange")}
          </Button>
        </Link>
      ) : (
        <Button variant="outline" disabled className="opacity-50 cursor-not-allowed">
          {t("compost.results.tooSmallToList", "Too small to list")}
        </Button>
      )}
      <Link href="/dashboard/map?layer=compost">
        <Button variant="ghost" className="text-muted-foreground">
          {t("compost.viewMap", "Find Nearby Sites")}
        </Button>
      </Link>
    </>
  );
}
