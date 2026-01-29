"use client";

import { Sprout, Sun, Apple, Recycle } from "lucide-react";
import type { TranslateFunction } from "../types";

interface JourneyVisualizerProps {
    t: TranslateFunction;
}

export function JourneyVisualizer({ t }: JourneyVisualizerProps) {
    const stages = [
        { id: "seed", label: t("forum.journey.seed", "Seed"), number: "01", icon: Sprout },
        { id: "growing", label: t("forum.journey.growing", "Grow"), number: "02", icon: Sun },
        { id: "harvest", label: t("forum.journey.harvest", "Harvest"), number: "03", icon: Apple },
        { id: "compost", label: t("forum.journey.compost", "Organic Compost"), number: "04", icon: Recycle },
    ];

    return (
        <div className="rounded-lg border border-border bg-card p-5">
            {/* Header */}
            <div className="mb-5">
                <h3 className="text-sm font-semibold text-foreground tracking-tight">
                    {t("forum.seedToSeed.title", "Seed to Seed")}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                    {t("forum.seedToSeed.description", "The complete cycle of sustainable farming.")}
                </p>
            </div>
            
            {/* Steps */}
            <div className="relative">
                {/* Connecting line - exactly between icon centers */}
                <div className="absolute top-4 left-10 right-10 h-px bg-border" />
                
                <div className="relative flex justify-between">
                    {stages.map((stage) => (
                        <div key={stage.id} className="flex flex-col items-center">
                            {/* Step indicator */}
                            <div className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center relative z-10">
                                <stage.icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
                            </div>
                            
                            {/* Label */}
                            <div className="mt-2 text-center">
                                <span className="text-[10px] text-muted-foreground/60 font-medium block">
                                    {stage.number}
                                </span>
                                <span className="text-xs text-foreground font-medium">
                                    {stage.label}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Cycle indicator */}
                <div className="mt-4 pt-3 border-t border-dashed border-border/60">
                    <p className="text-[11px] text-muted-foreground text-center">
                        {t("forum.seedToSeed.cycle", "Every harvest returns to seed")}
                    </p>
                </div>
            </div>
        </div>
    );
}
