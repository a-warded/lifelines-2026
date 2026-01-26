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

// Generate a single-line verdict (the advisor moment)
function getVerdict(
  result: CompostResult,
  valueEstimate: ReturnType<typeof estimateFertilizerValue> | null
): string {
  const parts: string[] = [];
  
  // Worth composting?
  if (result.totalWasteKg < 10) {
    parts.push("Small batch—consider waiting for more.");
  } else {
    parts.push("Worth composting.");
  }
  
  // Balance advice
  if (result.carbonContent === "high" && result.nitrogenContent === "low") {
    parts.push("Add greens.");
  } else if (result.nitrogenContent === "high" && result.carbonContent === "low") {
    parts.push("Add browns.");
  }
  
  // Sell advice
  if (valueEstimate && valueEstimate.highEstimate < 20) {
    parts.push("Use it yourself.");
  } else if (valueEstimate && result.estimatedFertilizerKg >= 10 && result.cnRatioBalanced) {
    parts.push("Sellable if needed.");
  } else if (valueEstimate && result.estimatedFertilizerKg >= 5) {
    parts.push("Don't sell unless mixed further.");
  }
  
  return parts.join(" ");
}

// Generate context-aware headline based on inputs
function getContextHeadline(entries: WasteFormEntry[], result: CompostResult): string {
  const primaryWaste = entries
    .filter((e) => e.wasteType && e.amountKg > 0)
    .sort((a, b) => b.amountKg - a.amountKg)[0];
  
  if (primaryWaste && primaryWaste.amountKg >= 5) {
    const label = WASTE_TYPE_LABELS[primaryWaste.wasteType as WasteType]?.label.toLowerCase() || "waste";
    return `${result.totalWasteKg} kg of ${label} → usable compost`;
  }
  
  return `This batch will produce ${result.estimatedFertilizerKg} kg of usable compost`;
}

// Generate warnings for feasibility section
function getFailureRisks(result: CompostResult): string[] {
  const risks: string[] = [];
  
  if (result.carbonContent === "high" && result.nitrogenContent === "low") {
    risks.push("Too much carbon. Will decompose slowly unless you add nitrogen-rich material.");
  }
  if (result.nitrogenContent === "high" && result.carbonContent === "low") {
    risks.push("Too much nitrogen. Expect ammonia smell. Add dry leaves or straw.");
  }
  if (result.totalWasteKg < 15) {
    risks.push("Small piles lose heat fast. May not reach temperatures that kill pathogens.");
  }
  if (result.compostingDays > 90) {
    risks.push("Long processing time. You'll need patience—or more greens to speed it up.");
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

  const verdict = getVerdict(result, valueEstimate);
  const contextHeadline = getContextHeadline(entries, result);
  const failureRisks = getFailureRisks(result);
  const worthExchanging = result.estimatedFertilizerKg >= 5;
  
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
          {contextHeadline}
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
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Verdict: </span>
            <span className="text-sm text-foreground">{verdict}</span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          PHASE 2: FEASIBILITY
          Time + what could go wrong
      ═══════════════════════════════════════════════════════════════ */}
      <div className="space-y-1 border-l-2 border-border/30 pl-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          Feasibility
        </div>
        
        {/* Timeline - always visible, not expandable */}
        <div className="flex items-baseline justify-between py-2">
          <span className="text-sm text-muted-foreground">Time to ready</span>
          <span className="text-sm font-medium text-foreground">~{result.compostingDays} days</span>
        </div>
        
        {/* Value - confident estimate */}
        {priceEstimate && priceEstimate > 0 && (
          <div className="flex items-baseline justify-between py-2">
            <span className="text-sm text-muted-foreground">Market value</span>
            <span className="text-sm font-medium text-foreground">
              {priceEstimate < 20 ? "Not worth selling" : `~$${priceEstimate}`}
            </span>
          </div>
        )}

        {/* Failure risks - sharper framing */}
        {failureRisks.length > 0 && (
          <ExpandableSection
            title="Why this batch might fail"
            isOpen={expanded === "risks"}
            onToggle={() => toggleExpand("risks")}
          >
            <ul className="space-y-2 text-sm">
              {failureRisks.map((risk, i) => (
                <li key={i} className="text-muted-foreground">
                  {risk}
                </li>
              ))}
            </ul>
          </ExpandableSection>
        )}

        {/* Breakdown - tucked away */}
        {result.breakdown.length > 1 && (
          <ExpandableSection
            title="Material breakdown"
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
                      {item.category === "green" ? "nitrogen" : "carbon"}
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
              ? "This batch meets minimum exchange size."
              : "You have enough volume to exchange, though larger batches get more interest."
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
          Too small to list
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
