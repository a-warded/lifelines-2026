"use client";

import { Button } from "@/components/ui/button";
import { X, RotateCcw, Check } from "lucide-react";
import { getCountryName } from "@/lib/geo";
import type { GeoLocation } from "@/lib/geo";
import type { ExchangeFilters, TranslateFunction } from "../types";
import { 
  LISTING_TYPE_OPTIONS, 
  LISTING_STATUS_OPTIONS, 
  LISTING_MODE_OPTIONS, 
  DELIVERY_METHODS 
} from "../constants";

interface ExchangeFiltersProps {
  filters: ExchangeFilters;
  setFilter: <K extends keyof ExchangeFilters>(key: K, value: ExchangeFilters[K]) => void;
  clearFilters: () => void;
  onApply: () => void;
  userCountry: string;
  userLocation: GeoLocation | null;
  locationError: string;
  locationStatus: "idle" | "loading" | "detecting" | "success" | "error";
  onDetectLocation: () => void;
  t: TranslateFunction;
}

export function ExchangeFilters({
  filters,
  setFilter,
  clearFilters,
  onApply,
  userCountry,
  userLocation,
  locationError,
  locationStatus,
  onDetectLocation,
  t,
}: ExchangeFiltersProps) {
  const hasActiveFilters = !!(filters.type || filters.status || filters.mode || filters.delivery);

  return (
    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-5 sticky top-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Filters
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Refine listings to find what you need
          </p>
        </div>
      </div>

      {/* Filter controls */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xs text-[var(--color-text-secondary)]">
          {hasActiveFilters ? "Filters applied" : "No filters applied"}
        </span>
        <button
          onClick={clearFilters}
          className="p-1.5 rounded-lg bg-[var(--color-background)] hover:bg-[var(--color-border)] transition-colors"
          aria-label="Clear filters"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
        </button>
        <button
          onClick={onApply}
          className="px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-xs font-medium flex items-center gap-1.5"
        >
          Apply <Check className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Type Filter */}
      <FilterSection
        title="LISTING TYPE"
        onClear={() => setFilter("type", "")}
      >
        <RadioGroup
          options={LISTING_TYPE_OPTIONS.map(opt => ({
            ...opt,
            label: opt.value ? t(`exchange.types.${opt.value}`, opt.label) : opt.label,
          }))}
          value={filters.type}
          onChange={(value) => setFilter("type", value)}
        />
      </FilterSection>

      {/* Status Filter */}
      <FilterSection
        title="LISTING STATUS"
        onClear={() => setFilter("status", "")}
        description="Find available, claimed, or completed listings"
      >
        <RadioGroup
          options={LISTING_STATUS_OPTIONS.map(opt => ({
            ...opt,
            label: opt.value ? t(`exchange.status.${opt.value}`, opt.label) : opt.label,
          }))}
          value={filters.status}
          onChange={(value) => setFilter("status", value)}
        />
      </FilterSection>

      {/* Mode Filter */}
      <FilterSection
        title="MODE"
        onClear={() => setFilter("mode", "")}
        description="Filter by offering or seeking"
      >
        <RadioGroup
          options={LISTING_MODE_OPTIONS.map(opt => ({
            ...opt,
            label: opt.value ? t(`exchange.mode.${opt.value}`, opt.label) : opt.label,
          }))}
          value={filters.mode}
          onChange={(value) => setFilter("mode", value)}
        />
      </FilterSection>

      {/* Delivery Method Filter */}
      <FilterSection
        title="DELIVERY"
        onClear={() => setFilter("delivery", "")}
        description="Filter by delivery method"
      >
        <div className="space-y-2 max-h-48 overflow-y-auto">
          <RadioOption
            label="All"
            selected={filters.delivery === ""}
            onClick={() => setFilter("delivery", "")}
          />
          {DELIVERY_METHODS.map((method) => (
            <RadioOption
              key={method.value}
              label={`${method.emoji} ${method.label}`}
              selected={filters.delivery === method.value}
              onClick={() => setFilter("delivery", method.value)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Location */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            LOCATION
          </h3>
        </div>
        <div className="text-sm text-[var(--color-text-secondary)]">
          {userLocation?.locationLabel || getCountryName(userCountry)}
        </div>
        {userLocation?.latitude && userLocation?.longitude && (
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
          </p>
        )}
        {locationError && (
          <p className="text-xs text-red-500 mt-2 leading-tight">
            {locationError}
          </p>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={onDetectLocation}
          disabled={locationStatus === "detecting"}
          className="mt-2 w-full text-xs"
        >
          {locationStatus === "detecting"
            ? t("exchange.create.locationDetecting", "Detecting...")
            : userLocation
              ? "Update Location"
              : t("exchange.create.useMyLocation", "Use My Location")}
        </Button>
      </div>
    </div>
  );
}

// Helper components
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
    <div className="mb-6">
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

function RadioGroup({
  options,
  value,
  onChange,
}: {
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <>
      {options.map((option) => (
        <RadioOption
          key={option.value}
          label={option.label}
          selected={value === option.value}
          onClick={() => onChange(option.value)}
        />
      ))}
    </>
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
