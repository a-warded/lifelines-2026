"use client";

import { Button } from "@/components/ui/button";
import { CATEGORIES, JOURNEY_STAGES } from "../constants";
import type { PostCategory, JourneyStage, TranslateFunction } from "../types";

interface ForumFiltersProps {
    category: PostCategory | "all";
    onCategoryChange: (category: PostCategory | "all") => void;
    journeyStage: JourneyStage | null;
    onJourneyStageChange: (stage: JourneyStage | null) => void;
    t: TranslateFunction;
}

export function ForumFilters({
    category,
    onCategoryChange,
    journeyStage,
    onJourneyStageChange,
    t,
}: ForumFiltersProps) {
    return (
        <div className="space-y-4">
            {/* Category filter */}
            <div>
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    {t("forum.filters.topic", "Topic")}
                </h4>
                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                        <Button
                            key={cat.value}
                            variant={category === cat.value ? "primary" : "ghost"}
                            size="sm"
                            onClick={() => onCategoryChange(cat.value)}
                            className={`text-xs ${category === cat.value ? "" : "text-muted-foreground"}`}
                        >
                            {t(cat.labelKey, cat.value === "all" ? "All" : cat.value)}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Journey stage filter */}
            <div>
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    {t("forum.filters.journeyStage", "Seed-to-Seed Journey")}
                </h4>
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant={!journeyStage ? "primary" : "ghost"}
                        size="sm"
                        onClick={() => onJourneyStageChange(null)}
                        className={`text-xs ${!journeyStage ? "" : "text-muted-foreground"}`}
                    >
                        {t("common.all", "All")}
                    </Button>
                    {JOURNEY_STAGES.map((stage) => (
                        <Button
                            key={stage.value}
                            variant={journeyStage === stage.value ? "primary" : "ghost"}
                            size="sm"
                            onClick={() => onJourneyStageChange(stage.value)}
                            className={`text-xs ${journeyStage === stage.value ? "" : "text-muted-foreground"}`}
                        >
                            {t(stage.labelKey, stage.value)}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
}
