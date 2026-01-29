"use client";

import { Sprout, Recycle } from "lucide-react";
import type { TranslateFunction } from "../types";

interface JourneyVisualizerProps {
    t: TranslateFunction;
}

export function JourneyVisualizer({ t }: JourneyVisualizerProps) {
    const stages = [
        { id: "seed", label: t("forum.journey.seed", "Seed"), icon: Sprout },
        { id: "growing", label: t("forum.journey.growing", "Growing"), icon: Sprout },
        { id: "harvest", label: t("forum.journey.harvest", "Harvest"), icon: Sprout },
        { id: "compost", label: t("forum.journey.compost", "Compost"), icon: Recycle },
    ];

    return (
        <div className="rounded-lg border border-border/50 p-4 bg-gradient-to-br from-green-50/50 to-amber-50/50 dark:from-green-950/20 dark:to-amber-950/20">
            <div className="flex items-center gap-2 mb-3">
                <Recycle className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm text-foreground">
                    {t("forum.seedToSeed.title", "Seed to Seed")}
                </h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
                {t("forum.seedToSeed.description", "The complete cycle of sustainable farming. Every ending is a new beginning.")}
            </p>
            
            {/* Circular journey visualization */}
            <div className="relative">
                <div className="flex items-center justify-between">
                    {stages.map((stage, index) => (
                        <div key={stage.id} className="flex flex-col items-center relative">
                            <div className="w-10 h-10 rounded-full bg-card border-2 border-primary/30 flex items-center justify-center">
                                <stage.icon className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-xs text-muted-foreground mt-1.5">{stage.label}</span>
                            
                            {/* Arrow to next */}
                            {index < stages.length - 1 && (
                                <div className="absolute top-5 left-full w-full h-0.5 bg-gradient-to-r from-primary/30 to-primary/10 -translate-y-1/2" 
                                    style={{ width: "calc(100% - 40px)", marginLeft: "20px" }}
                                />
                            )}
                        </div>
                    ))}
                </div>
                
                {/* Return arrow */}
                <div className="flex justify-center mt-3">
                    <div className="flex items-center gap-1 text-xs text-primary">
                        <Sprout className="w-3 h-3" />
                        <span>{t("forum.seedToSeed.cycle", "And the cycle continues...")}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
