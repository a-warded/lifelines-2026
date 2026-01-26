"use client";

import { Badge, Button, Card, CardContent } from "@/components/ui";
import {
    CheckCircle2,
    Clock,
    Droplets,
    Leaf,
    Plus,
    AlertTriangle,
    Calendar,
} from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import type { Plan, Profile, RecommendedCrop } from "../types";
import { DIFFICULTY_COLORS } from "../types";

interface FallbackWarningProps {
  profile: Profile | null;
  fallbackNotes: string;
}

export function FallbackWarning({ profile, fallbackNotes }: FallbackWarningProps) {
    const { t } = useTranslation();
  
    const showWarning =
    profile?.waterAvailability === "none" ||
    (profile?.waterAvailability === "low" && profile?.sunlight === "high");

    if (!showWarning || !fallbackNotes) return null;

    return (
        <Card className="border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950">
            <CardContent className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                    <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                        {t("plan.view.challengingConditions")}
                    </h3>
                    <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                        {fallbackNotes}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

interface CropCardProps {
  crop: RecommendedCrop;
  index: number;
  isOffline: boolean;
  isAdded: boolean;
  isAdding: boolean;
  onAdd: () => void;
}

export function CropCard({
    crop,
    index,
    isOffline,
    isAdded,
    isAdding,
    onAdd,
}: CropCardProps) {
    const { t } = useTranslation();

    return (
        <div className="flex items-start gap-4 rounded-lg border p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700 dark:bg-green-900 dark:text-green-300">
                {index + 1}
            </div>
            <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{crop.cropName}</h3>
                    <Badge variant={DIFFICULTY_COLORS[crop.difficulty]}>
                        {t(`plan.difficulty.${crop.difficulty}`)}
                    </Badge>
                    <Badge variant="outline">
                        <Clock className="mr-1 h-3 w-3" />
            ~{crop.timeToHarvestDays} {t("units.days")}
                    </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{crop.reason}</p>
            </div>
            {!isOffline && (
                <Button
                    size="sm"
                    variant={isAdded ? "secondary" : "outline"}
                    onClick={onAdd}
                    disabled={isAdding || isAdded}
                    className="shrink-0"
                >
                    {isAdded ? <CheckCircle2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </Button>
            )}
        </div>
    );
}

interface RecommendedCropsCardProps {
  plan: Plan;
  isOffline: boolean;
  addedCrops: Set<string>;
  addingCrops: boolean;
  onAddCrop: (cropName: string) => void;
  onAddAll: () => void;
}

export function RecommendedCropsCard({
    plan,
    isOffline,
    addedCrops,
    addingCrops,
    onAddCrop,
    onAddAll,
}: RecommendedCropsCardProps) {
    const { t } = useTranslation();

    return (
        <Card>
            <CardContent>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-lg font-semibold">
                        <Leaf className="h-5 w-5 text-green-600" />
                        {t("plan.view.recommendedCrops.title")}
                    </h2>
                    {!isOffline && plan.recommendedCrops.length > 0 && (
                        <Button
                            size="sm"
                            onClick={onAddAll}
                            disabled={addingCrops || addedCrops.size === plan.recommendedCrops.length}
                        >
                            {addedCrops.size === plan.recommendedCrops.length ? (
                                <>
                                    <CheckCircle2 className="me-2 h-4 w-4" />
                                    {t("plan.view.recommendedCrops.addedAll", "Added All")}
                                </>
                            ) : (
                                <>
                                    <Plus className="me-2 h-4 w-4" />
                                    {t("plan.view.recommendedCrops.addAllToFarm", "Add All to Farm")}
                                </>
                            )}
                        </Button>
                    )}
                </div>
                <div className="space-y-4">
                    {plan.recommendedCrops.map((crop, index) => (
                        <CropCard
                            key={crop.cropName}
                            crop={crop}
                            index={index}
                            isOffline={isOffline}
                            isAdded={addedCrops.has(crop.cropName)}
                            isAdding={addingCrops}
                            onAdd={() => onAddCrop(crop.cropName)}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

interface WaterEstimateCardProps {
  liters: number;
  firstCropName?: string;
}

export function WaterEstimateCard({ liters, firstCropName }: WaterEstimateCardProps) {
    const { t } = useTranslation();

    return (
        <Card className="border-cyan-200 bg-cyan-50 dark:border-cyan-800 dark:bg-cyan-950">
            <CardContent className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Droplets className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                    <div>
                        <p className="font-semibold text-cyan-800 dark:text-cyan-200">
                            {t("plan.view.water.title")}
                        </p>
                        <p className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">
                            {liters} {t("units.liters")}
                        </p>
                    </div>
                </div>
                <Link href={`/dashboard/water?crop=${firstCropName || "tomato"}&plants=2`}>
                    <Button variant="outline" size="sm">
                        {t("plan.view.water.openCalculator")}
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}

interface ChecklistCardProps {
  items: string[];
}

// Legacy checklist item mapping for old database entries
const LEGACY_CHECKLIST_MAP: Record<string, string> = {
    "Find or prepare growing containers/space": "plan.view.checklist.items.findContainers",
    "Ensure adequate drainage": "plan.view.checklist.items.ensureDrainage",
    "Prepare soil or growing medium": "plan.view.checklist.items.prepareSoil",
    "Source seeds or seedlings": "plan.view.checklist.items.sourceSeeds",
    "Set up watering system or schedule": "plan.view.checklist.items.setupWatering",
    "Plan for sun/shade management": "plan.view.checklist.items.planSunShade",
    "Consider salt-flushing or container growing": "plan.view.checklist.items.saltFlushing",
    "Set up water recycling/collection": "plan.view.checklist.items.waterRecycling",
    "Establish water source or collection system": "plan.view.checklist.items.establishWater",
    // Legacy seed data mappings
    "Prepare containers or growing area": "plan.view.checklist.items.findContainers",
    "Test soil pH and salinity": "plan.view.checklist.items.prepareSoil",
    "Set up irrigation system": "plan.view.checklist.items.setupWatering",
    "Acquire seeds from exchange or nursery": "plan.view.checklist.items.sourceSeeds",
    "Prepare compost or organic fertilizer": "plan.view.checklist.items.prepareSoil",
    "Install shade cloth if needed": "plan.view.checklist.items.planSunShade",
    "Create planting schedule": "plan.view.checklist.items.setupWatering",
    "Connect with local farming community": "plan.view.checklist.items.sourceSeeds",
    "Plan water collection system": "plan.view.checklist.items.waterRecycling",
    "Prepare seedling trays": "plan.view.checklist.items.findContainers",
};

export function ChecklistCard({ items }: ChecklistCardProps) {
    const { t } = useTranslation();

    // Helper to translate checklist items (they are now translation keys)
    const translateItem = (item: string) => {
    // Check if it's a translation key
        if (item.startsWith("plan.view.checklist.items.")) {
            return t(item);
        }
        // Check legacy mapping
        if (LEGACY_CHECKLIST_MAP[item]) {
            return t(LEGACY_CHECKLIST_MAP[item]);
        }
        // Fallback for legacy data
        return item;
    };

    return (
        <Card>
            <CardContent>
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    {t("plan.view.checklist.title")}
                </h2>
                <ul className="space-y-2">
                    {items.map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                            <span className="text-sm">{translateItem(item)}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}

interface TimelineCardProps {
  timeline: Plan["timeline"];
}

// Legacy timeline label mapping
const LEGACY_LABEL_MAP: Record<string, string> = {
    "Today": "plan.view.timeline.today",
    "This Week": "plan.view.timeline.thisWeek",
    "Week 2+": "plan.view.timeline.week2",
    "+Week 2": "plan.view.timeline.week2",
};

// Legacy timeline step mapping
const LEGACY_STEP_MAP: Record<string, string> = {
    "Survey your growing space and note sunlight patterns": "plan.view.timeline.steps.surveySpace",
    "Gather containers with drainage holes": "plan.view.timeline.steps.gatherContainers",
    "Mark out your growing area": "plan.view.timeline.steps.markArea",
    "Check your water source and storage options": "plan.view.timeline.steps.checkWater",
    "Set up water collection containers if possible": "plan.view.timeline.steps.setupWaterCollection",
    "Fill containers with growing medium or soil mix": "plan.view.timeline.steps.fillContainers",
    "Prepare soil - remove debris, loosen top layer": "plan.view.timeline.steps.prepareSoil",
    "Create a simple watering schedule": "plan.view.timeline.steps.createSchedule",
    "Set up basic shade protection if needed": "plan.view.timeline.steps.setupShade",
    "Consider raised beds or containers to avoid salty ground soil": "plan.view.timeline.steps.considerRaised",
    "Plant your first seeds following spacing guidelines": "plan.view.timeline.steps.plantSeeds",
    "Establish morning watering routine": "plan.view.timeline.steps.morningWatering",
    "Monitor for pests - check leaves daily": "plan.view.timeline.steps.monitorPests",
    "Add mulch to retain moisture": "plan.view.timeline.steps.addMulch",
    "Connect with local growers through the Exchange feature": "plan.view.timeline.steps.connectGrowers",
    "Keep a simple log of what you plant and when": "plan.view.timeline.steps.keepLog",
    // Legacy seed data mappings
    "Prepare growing containers or beds": "plan.view.timeline.steps.gatherContainers",
    "Check water supply availability": "plan.view.timeline.steps.checkWater",
    "Gather seeds or seedlings from exchange": "plan.view.timeline.steps.surveySpace",
    "Plant seeds in prepared soil": "plan.view.timeline.steps.plantSeeds",
    "Set up drip irrigation if available": "plan.view.timeline.steps.createSchedule",
    "Install shade cloth for hot days": "plan.view.timeline.steps.setupShade",
    "Monitor seedling growth daily": "plan.view.timeline.steps.monitorPests",
    "Adjust watering based on weather": "plan.view.timeline.steps.morningWatering",
    "Watch for pests and treat organically": "plan.view.timeline.steps.monitorPests",
    "Thin seedlings if overcrowded": "plan.view.timeline.steps.addMulch",
    "Begin harvesting quick-growing crops": "plan.view.timeline.steps.connectGrowers",
};

export function TimelineCard({ timeline }: TimelineCardProps) {
    const { t } = useTranslation();

    // Helper to translate timeline labels
    const translateLabel = (label: string) => {
        if (label.startsWith("plan.view.timeline.")) {
            return t(label);
        }
        // Check legacy mapping
        if (LEGACY_LABEL_MAP[label]) {
            return t(LEGACY_LABEL_MAP[label]);
        }
        // Fallback for legacy data
        return label;
    };

    // Helper to translate timeline steps
    const translateStep = (step: string) => {
    // Check for special format with crops list: "key::crops"
        if (step.includes("::")) {
            const [key, crops] = step.split("::");
            return t(key, { crops });
        }
        // Check if it's a translation key
        if (step.startsWith("plan.view.timeline.steps.")) {
            return t(step);
        }
        // Check legacy mapping
        if (LEGACY_STEP_MAP[step]) {
            return t(LEGACY_STEP_MAP[step]);
        }
        // Check if it starts with "Obtain seeds" (special case with crop list)
        if (step.startsWith("Obtain seeds or seedlings for:")) {
            const crops = step.replace("Obtain seeds or seedlings for:", "").trim();
            return t("plan.view.timeline.steps.obtainSeeds", { crops });
        }
        // Fallback for legacy data
        return step;
    };

    return (
        <Card>
            <CardContent>
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                    <Calendar className="h-5 w-5 text-primary" />
                    {t("plan.view.timeline.title")}
                </h2>
                <div className="space-y-6">
                    {timeline.map((block) => (
                        <div key={block.label}>
                            <h3 className="mb-2 font-semibold text-primary">{translateLabel(block.label)}</h3>
                            <ul className="space-y-1.5 border-l-2 border-primary/30 pl-4">
                                {block.steps.map((step, index) => (
                                    <li
                                        key={index}
                                        className="relative text-sm before:absolute before:-left-[21px] before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-primary/50"
                                    >
                                        {translateStep(step)}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
