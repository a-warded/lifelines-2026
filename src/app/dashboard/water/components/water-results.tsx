"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WaterCalculationResult, TranslateFunction } from "../types";

interface WaterResultsProps {
  result: WaterCalculationResult | null;
  t: TranslateFunction;
}

export function WaterResults({ result, t }: WaterResultsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("water.results.title", "Daily Water Need")}</CardTitle>
            </CardHeader>
            <CardContent>
                {result && result.entries.length > 0 ? (
                    <div className="space-y-4">
                        {/* Big total display */}
                        <div className="text-center py-4">
                            <div className="text-5xl font-bold text-primary">
                                {result.totalDailyLiters}
                            </div>
                            <div className="text-muted-foreground mt-1">
                                {t("units.liters", "liters")}/{t("units.days", "day").toLowerCase()}
                            </div>
                        </div>

                        {/* Warning */}
                        {result.warning && (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm dark:bg-yellow-950/30 dark:border-yellow-800 dark:text-yellow-400">
                                {result.warning}
                            </div>
                        )}

                        {/* Breakdown */}
                        <ResultsBreakdown result={result} t={t} />
                    </div>
                ) : (
                    <EmptyState t={t} />
                )}
            </CardContent>
        </Card>
    );
}

function ResultsBreakdown({ 
    result, 
    t 
}: { 
  result: WaterCalculationResult; 
  t: TranslateFunction;
}) {
    return (
        <div>
            <h4 className="font-medium mb-2 text-sm">
                {t("water.results.breakdown", "Per Plant Breakdown")}
            </h4>
            <div className="space-y-2">
                {result.entries.map((entry, i) => (
                    <div
                        key={i}
                        className="flex justify-between items-center p-2 bg-muted rounded"
                    >
                        <div>
                            <span className="font-medium">{entry.plantName}</span>
                            <span className="text-muted-foreground text-sm ml-2">
                ×{entry.count}
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="font-medium">{entry.totalLiters}L</span>
                            <span className="text-muted-foreground text-sm ml-1">
                ({entry.litersPerPlant}L/plant)
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function EmptyState({ t }: { t: TranslateFunction }) {
    return (
        <div className="text-center py-8 text-muted-foreground">
            {t("water.results.noPlants", "Add plants to calculate water needs")}
        </div>
    );
}
