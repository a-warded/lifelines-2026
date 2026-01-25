"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WaterCalculationResult, WaterHistory, TranslateFunction } from "../types";

interface WaterTipsProps {
  tips: string[];
  t: TranslateFunction;
}

export function WaterTips({ tips, t }: WaterTipsProps) {
  if (tips.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>💧 {t("common.info", "Tips")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {tips.map((tip, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <span className="text-green-500 mt-0.5">•</span>
              {tip}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

interface WaterHistoryCardProps {
  history: WaterHistory[];
  t: TranslateFunction;
}

export function WaterHistoryCard({ history, t }: WaterHistoryCardProps) {
  if (history.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("water.history.title", "Recent Calculations")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {history.slice(0, 5).map((h, i) => (
            <div
              key={i}
              className="flex justify-between items-center p-2 bg-muted rounded text-sm"
            >
              <div className="flex flex-wrap gap-1">
                {h.plants.slice(0, 3).map((p, j) => (
                  <Badge key={j} variant="secondary">
                    {p}
                  </Badge>
                ))}
                {h.plants.length > 3 && (
                  <Badge variant="secondary">+{h.plants.length - 3}</Badge>
                )}
              </div>
              <div className="font-medium">{h.total}L</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
