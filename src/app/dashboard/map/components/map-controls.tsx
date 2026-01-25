"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Recycle, RefreshCw, Search, Users } from "lucide-react";
import type { MapLayer, MapStats } from "../types";

interface MapHeaderProps {
  onRefresh: () => void;
  loading: boolean;
}

export function MapHeader({ onRefresh, loading }: MapHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold">Community Map</h1>
        <p className="text-muted-foreground">
          Discover farms, composting sites, and connect with your community
        </p>
      </div>
      <Button onClick={onRefresh} variant="outline" disabled={loading}>
        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        Refresh
      </Button>
    </div>
  );
}

interface LayerToggleProps {
  activeLayer: MapLayer;
  onLayerChange: (layer: MapLayer) => void;
}

export function LayerToggle({ activeLayer, onLayerChange }: LayerToggleProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={activeLayer === "all" ? "primary" : "outline"}
        size="sm"
        onClick={() => onLayerChange("all")}
      >
        🗺️ All
      </Button>
      <Button
        variant={activeLayer === "farms" ? "primary" : "outline"}
        size="sm"
        onClick={() => onLayerChange("farms")}
      >
        🌱 Farms Only
      </Button>
      <Button
        variant={activeLayer === "compost" ? "primary" : "outline"}
        size="sm"
        onClick={() => onLayerChange("compost")}
      >
        ♻️ Compost Sites Only
      </Button>
    </div>
  );
}

interface MapStatsCardsProps {
  stats: MapStats;
}

export function MapStatsCards({ stats }: MapStatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-4">
      <Card>
        <CardContent className="flex items-center gap-3 py-4">
          <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900">
            <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.totalFarms}</p>
            <p className="text-xs text-muted-foreground">Active Farms</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-3 py-4">
          <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900">
            <Recycle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.totalCompostSites}</p>
            <p className="text-xs text-muted-foreground">Compost Sites</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-3 py-4">
          <div className="rounded-lg bg-teal-100 p-2 dark:bg-teal-900">
            <MapPin className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.totalCrops}</p>
            <p className="text-xs text-muted-foreground">Crop Types</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-3 py-4">
          <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900">
            <span className="flex h-5 w-5 items-center justify-center text-lg">🌱</span>
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.totalPlants.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Plants</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface MapSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function MapSearch({ value, onChange }: MapSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search farms by name, location, or crops..."
        className="pl-10"
      />
    </div>
  );
}
