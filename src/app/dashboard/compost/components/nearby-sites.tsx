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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <span>♻️</span>
            {t("compost.nearbySites", "Nearby Compost Sites")}
          </span>
          <Button variant="ghost" size="sm" onClick={onAddSite}>
            <Plus className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingSpinner />
        ) : sites.length > 0 ? (
          <SitesList sites={sites} t={t} />
        ) : (
          <EmptyState onAddSite={onAddSite} t={t} />
        )}
      </CardContent>
    </Card>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
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
    <div className="space-y-3">
      {sites.map((site) => (
        <SiteCard key={site.id} site={site} />
      ))}
      <Link href="/dashboard?showCompost=true">
        <Button variant="outline" className="w-full">
          {t("compost.viewAllSites", "View All on Map")}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}

function SiteCard({ site }: { site: CompostSite }) {
  return (
    <div className="rounded-lg border p-3 transition-colors hover:bg-muted/50">
      <div className="flex items-start gap-2">
        <span className="text-xl">{site.siteEmoji || "♻️"}</span>
        <div className="flex-1">
          <h4 className="font-medium">{site.siteName}</h4>
          <p className="text-xs text-muted-foreground">
            {site.locationLabel || site.siteType}
          </p>
          <div className="mt-1 flex flex-wrap gap-1">
            {site.acceptsWaste && (
              <Badge variant="outline" className="text-xs">
                📥 Accepts waste
              </Badge>
            )}
            {site.sellsFertilizer && (
              <Badge variant="outline" className="text-xs">
                🌱 Has fertilizer
              </Badge>
            )}
          </div>
        </div>
        {site.distance !== undefined && (
          <span className="text-sm text-muted-foreground">
            {site.distance.toFixed(1)} km
          </span>
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
    <div className="py-6 text-center">
      <p className="mb-3 text-sm text-muted-foreground">
        {t("compost.noNearbySites", "No composting sites nearby yet")}
      </p>
      <Button variant="outline" size="sm" onClick={onAddSite}>
        <Plus className="mr-2 h-4 w-4" />
        {t("compost.addSite", "Add Your Site")}
      </Button>
    </div>
  );
}
