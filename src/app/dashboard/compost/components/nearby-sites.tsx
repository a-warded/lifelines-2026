"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import type { CompostSite, TranslateFunction } from "../types";

interface NearbySitesProps {
  sites: CompostSite[];
  loading: boolean;
  onAddSite: () => void;
  t: TranslateFunction;
}

export function NearbySites({ sites, loading, onAddSite, t }: NearbySitesProps) {
    return (
        <div className="rounded-lg border border-border/50 p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground text-sm">
                    {t("compost.nearbySites", "Nearby sites")}
                </h3>
                <Button variant="ghost" size="sm" onClick={onAddSite} className="h-7 px-2 text-muted-foreground">
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
      
            {loading ? (
                <LoadingSpinner />
            ) : sites.length > 0 ? (
                <SitesList sites={sites} t={t} />
            ) : (
                <EmptyState onAddSite={onAddSite} t={t} />
            )}
        </div>
    );
}

function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center py-6">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground/60" />
        </div>
    );
}

function SitesList({ 
    sites, 
    t 
}: { 
  sites: CompostSite[]; 
  t: TranslateFunction;
}) {
    return (
        <div className="space-y-2">
            {sites.slice(0, 3).map((site) => (
                <SiteCard key={site.id} site={site} />
            ))}
            {sites.length > 3 && (
                <p className="text-xs text-muted-foreground pt-1">
          +{sites.length - 3} more
                </p>
            )}
            <Link href="/dashboard?showCompost=true" className="block pt-2">
                <Button variant="ghost" size="sm" className="w-full justify-between text-muted-foreground hover:text-foreground">
                    {t("compost.viewAllSites", "View on map")}
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </Link>
        </div>
    );
}

function SiteCard({ site }: { site: CompostSite }) {
    return (
        <div className="rounded-md border border-border/30 p-2.5 transition-colors hover:bg-muted/30">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-sm text-foreground truncate">{site.siteName}</h4>
                    <p className="text-xs text-muted-foreground truncate">
                        {site.locationLabel || site.siteType}
                    </p>
                </div>
                {site.distance !== undefined && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {site.distance.toFixed(1)} km
                    </span>
                )}
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1">
                {site.acceptsWaste && (
                    <span className="text-xs text-muted-foreground">Accepts waste</span>
                )}
                {site.acceptsWaste && site.sellsFertilizer && (
                    <span className="text-xs text-muted-foreground">·</span>
                )}
                {site.sellsFertilizer && (
                    <span className="text-xs text-muted-foreground">Sells fertilizer</span>
                )}
            </div>
        </div>
    );
}

function EmptyState({ 
    onAddSite, 
    t 
}: { 
  onAddSite: () => void; 
  t: TranslateFunction;
}) {
    return (
        <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">
                {t("compost.noNearbySites", "No sites nearby")}
            </p>
            <Button variant="ghost" size="sm" onClick={onAddSite} className="text-muted-foreground">
                <Plus className="mr-1.5 h-4 w-4" />
                {t("compost.addSite", "Add yours")}
            </Button>
        </div>
    );
}
