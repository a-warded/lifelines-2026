"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import type { TranslateFunction } from "../types";

interface SidebarCardsProps {
  t: TranslateFunction;
}

export function SidebarCards({ t }: SidebarCardsProps) {
  const [showReference, setShowReference] = useState(false);
  
  return (
    <>
      {/* Exchange Link - Practical, not cute */}
      <div className="rounded-lg border border-border/50 p-4">
        <h3 className="font-semibold text-foreground text-sm">
          {t("compost.exchange.title", "Got extra compost?")}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {t(
            "compost.exchange.description",
            "Trade it for seeds or produce. Most exchanges happen within 5km."
          )}
        </p>
        <Link href="/dashboard/exchange?type=fertilizer" className="mt-3 block">
          <Button variant="ghost" size="sm" className="w-full justify-between text-muted-foreground hover:text-foreground">
            {t("compost.exchange.viewListings", "See what's available")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Quick reference - collapsible, human title */}
      <div className="rounded-lg border border-border/50">
        <button
          onClick={() => setShowReference(!showReference)}
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <span className="font-semibold text-foreground text-sm">
            If you care about the details
          </span>
          {showReference ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        
        {showReference && (
          <div className="px-4 pb-4 space-y-2.5 text-sm border-t border-border/50 pt-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ideal C:N ratio</span>
              <span className="font-medium text-foreground">25:1 – 30:1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Target moisture</span>
              <span className="font-medium text-foreground">50–60%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Minimum batch</span>
              <span className="font-medium text-foreground">15+ kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Turn frequency</span>
              <span className="font-medium text-foreground">Every 1-2 weeks</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
