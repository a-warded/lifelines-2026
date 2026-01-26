"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import type { Farm, CompostSite } from "../types";

interface FarmDetailsCardProps {
  farm: Farm;
  onClose: () => void;
}

export function FarmDetailsCard({ farm, onClose }: FarmDetailsCardProps) {
    const { t } = useTranslation();

    return (
        <Card className="border-primary">
            <CardContent className="py-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">{farm.farmName || t("map.farm")}</h3>
                        {farm.userName && (
                            <p className="text-sm text-muted-foreground">{t("map.by")} {farm.userName}</p>
                        )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
                    </Button>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div>
                        <p className="text-xs text-muted-foreground">{t("map.location")}</p>
                        <p className="text-sm">
                            {farm.locationLabel ||
                `${farm.latitude.toFixed(2)}, ${farm.longitude.toFixed(2)}`}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">{t("map.spaceType")}</p>
                        <p className="text-sm capitalize">{farm.spaceType}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">{t("map.dailyWater")}</p>
                        <p className="text-sm">{farm.dailyWaterLiters.toFixed(1)}L</p>
                    </div>
                </div>
                {farm.crops && farm.crops.length > 0 && (
                    <div className="mt-4">
                        <p className="mb-2 text-xs text-muted-foreground">{t("map.growing")}</p>
                        <div className="flex flex-wrap gap-2">
                            {farm.crops.map((crop, i) => (
                                <span
                                    key={i}
                                    className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300"
                                >
                                    {crop.plantName} ({crop.count})
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

interface CompostSiteDetailsCardProps {
  site: CompostSite;
  onClose: () => void;
}

export function CompostSiteDetailsCard({ site, onClose }: CompostSiteDetailsCardProps) {
    const { t } = useTranslation();

    return (
        <Card className="border-emerald-500">
            <CardContent className="py-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">{site.siteEmoji || "♻️"}</span>
                        <div>
                            <h3 className="text-lg font-semibold">{site.siteName}</h3>
                            {site.userName && (
                                <p className="text-sm text-muted-foreground">{t("map.by")} {site.userName}</p>
                            )}
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
                    </Button>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div>
                        <p className="text-xs text-muted-foreground">{t("map.location")}</p>
                        <p className="text-sm">
                            {site.locationLabel ||
                `${site.latitude.toFixed(2)}, ${site.longitude.toFixed(2)}`}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">{t("map.siteType")}</p>
                        <p className="text-sm capitalize">{site.siteType}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">{t("map.services")}</p>
                        <div className="flex flex-wrap gap-1">
                            {site.acceptsWaste && (
                                <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                  📥 {t("map.acceptsWaste")}
                                </span>
                            )}
                            {site.sellsFertilizer && (
                                <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900 dark:text-green-300">
                  🌱 {t("map.hasFertilizer")}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                {site.description && (
                    <div className="mt-4">
                        <p className="mb-1 text-xs text-muted-foreground">{t("map.descriptionLabel")}</p>
                        <p className="text-sm">{site.description}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
