import type { PostCategory, JourneyStage } from "./types";

export const CATEGORIES: { value: PostCategory | "all"; labelKey: string }[] = [
    { value: "all", labelKey: "forum.categories.all" },
    { value: "composting", labelKey: "forum.categories.composting" },
    { value: "water-saving", labelKey: "forum.categories.waterSaving" },
    { value: "seed-saving", labelKey: "forum.categories.seedSaving" },
    { value: "crop-rotation", labelKey: "forum.categories.cropRotation" },
    { value: "organic", labelKey: "forum.categories.organic" },
    { value: "zero-waste", labelKey: "forum.categories.zeroWaste" },
    { value: "general", labelKey: "forum.categories.general" },
];

export const JOURNEY_STAGES: { value: JourneyStage; labelKey: string; color: string }[] = [
    { value: "seed", labelKey: "forum.journey.seed", color: "bg-amber-500/20 text-amber-700 dark:text-amber-400" },
    { value: "growing", labelKey: "forum.journey.growing", color: "bg-green-500/20 text-green-700 dark:text-green-400" },
    { value: "harvest", labelKey: "forum.journey.harvest", color: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400" },
    { value: "compost", labelKey: "forum.journey.compost", color: "bg-orange-500/20 text-orange-700 dark:text-orange-400" },
    { value: "full-cycle", labelKey: "forum.journey.fullCycle", color: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400" },
];

export const DEFAULT_CREATE_FORM = {
    title: "",
    content: "",
    category: "general" as PostCategory,
    journeyStage: undefined as JourneyStage | undefined,
    imageUrl: "",
};
