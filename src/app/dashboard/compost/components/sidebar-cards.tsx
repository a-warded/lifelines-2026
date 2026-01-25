"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Recycle } from "lucide-react";
import Link from "next/link";
import type { TranslateFunction } from "../types";

interface SidebarCardsProps {
  t: TranslateFunction;
}

export function SidebarCards({ t }: SidebarCardsProps) {
  return (
    <>
      {/* Quick Info Card */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
        <CardContent className="p-4">
          <h3 className="mb-2 flex items-center gap-2 font-semibold">
            <span>💡</span>
            {t("compost.quickTips.title", "Did You Know?")}
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span>🌍</span>
              {t(
                "compost.quickTips.tip1",
                "Composting reduces methane emissions from landfills by up to 50%"
              )}
            </li>
            <li className="flex items-start gap-2">
              <span>💰</span>
              {t(
                "compost.quickTips.tip2",
                "Organic fertilizer can cost 2-3x more than homemade compost"
              )}
            </li>
            <li className="flex items-start gap-2">
              <span>🌱</span>
              {t(
                "compost.quickTips.tip3",
                "Compost improves soil water retention by up to 20%"
              )}
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Exchange Link */}
      <Card>
        <CardContent className="p-4">
          <h3 className="mb-2 flex items-center gap-2 font-semibold">
            <Recycle className="h-4 w-4" />
            {t("compost.exchange.title", "Exchange Fertilizer")}
          </h3>
          <p className="mb-3 text-sm text-muted-foreground">
            {t(
              "compost.exchange.description",
              "Have extra compost? Share it with your community or trade for seeds and produce."
            )}
          </p>
          <Link href="/dashboard/exchange?type=fertilizer">
            <Button variant="outline" className="w-full">
              {t("compost.exchange.viewListings", "View Fertilizer Listings")}
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </>
  );
}
