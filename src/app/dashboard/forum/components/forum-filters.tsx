"use client";

import { Check, RotateCcw, X } from "lucide-react";
import { CATEGORIES, JOURNEY_STAGES } from "../constants";
import type { PostCategory, JourneyStage, TranslateFunction } from "../types";

interface ForumFiltersProps {
    category: PostCategory | "all";
    onCategoryChange: (category: PostCategory | "all") => void;
    journeyStage: JourneyStage | null;
    onJourneyStageChange: (stage: JourneyStage | null) => void;
    onClearFilters: () => void;
    t: TranslateFunction;
}

export function ForumFilters({
    category,
    onCategoryChange,
    journeyStage,
    onJourneyStageChange,
    onClearFilters,
    t,
}: ForumFiltersProps) {
    const hasActiveFilters = category !== "all" || journeyStage !== null;

    return (
        <div className="space-y-6">
            {/* Filter controls */}
            <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--color-text-secondary)]">
                    {hasActiveFilters 
                        ? t("forum.filters.applied", "Filters applied") 
                        : t("forum.filters.noFilters", "No filters applied")}
                </span>
                <button
                    onClick={onClearFilters}
                    className="p-1.5 rounded-lg bg-[var(--color-background)] hover:bg-[var(--color-border)] transition-colors"
                    aria-label={t("forum.filters.clear", "Clear filters")}
                >
                    <RotateCcw className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
                </button>
            </div>

            {/* Category filter */}
            <FilterSection
                title={t("forum.filters.topic", "TOPIC")}
                onClear={() => onCategoryChange("all")}
            >
                {CATEGORIES.map((cat) => (
                    <RadioOption
                        key={cat.value}
                        label={t(cat.labelKey, cat.value === "all" ? "All" : cat.value)}
                        selected={category === cat.value}
                        onClick={() => onCategoryChange(cat.value)}
                    />
                ))}
            </FilterSection>

            {/* Journey stage filter */}
            <FilterSection
                title={t("forum.filters.journeyStage", "SEED-TO-SEED JOURNEY")}
                onClear={() => onJourneyStageChange(null)}
                description={t("forum.filters.journeyDescription", "Filter by farming stage")}
            >
                <RadioOption
                    label={t("common.all", "All Stages")}
                    selected={!journeyStage}
                    onClick={() => onJourneyStageChange(null)}
                />
                {JOURNEY_STAGES.map((stage) => (
                    <RadioOption
                        key={stage.value}
                        label={t(stage.labelKey, stage.value)}
                        selected={journeyStage === stage.value}
                        onClick={() => onJourneyStageChange(stage.value)}
                    />
                ))}
            </FilterSection>
        </div>
    );
}

// Helper components - matching exchange-filters.tsx pattern
function FilterSection({
    title,
    description,
    onClear,
    children,
}: {
    title: string;
    description?: string;
    onClear: () => void;
    children: React.ReactNode;
}) {
    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {title}
                </h3>
                <button
                    onClick={onClear}
                    className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                    aria-label={`Clear ${title.toLowerCase()} filter`}
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
            {description && (
                <p className="text-xs text-[var(--color-text-secondary)] mb-2">
                    {description}
                </p>
            )}
            <div className="space-y-2">{children}</div>
        </div>
    );
}

function RadioOption({
    label,
    selected,
    onClick,
}: {
    label: string;
    selected: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex items-center gap-2 cursor-pointer w-full text-left hover:bg-[var(--color-background)] rounded p-1 -m-1 transition-colors"
        >
            <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selected
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                        : "border-[var(--color-border)]"
                }`}
            >
                {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
            <span className="text-sm text-[var(--color-text-primary)]">{label}</span>
        </button>
    );
}
