"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getCountryFromCoords, getCountryName, getUserLocation } from "@/lib/geo";
import {
    ArrowLeft,
    ArrowRight,
    Check,
    Droplets,
    HomeIcon,
    Leaf,
    MapPin,
    Sun,
    Target
} from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ColorBends from "../ColorBends";
import { FadesLogo } from "../fades-logo";
import SplitText from "../SplitText";

// dynamically import the map to avoid ssr issues. next.js be acting goofy sometimes
const LocationPickerMap = dynamic(
    () => import("./location-picker-map").then((mod) => mod.LocationPickerMap),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-muted/50">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        ),
    }
);

interface OnboardingData {
    farmName: string;
    farmEmoji: string;
    waterAvailability: "none" | "low" | "medium" | "high";
    soilCondition: "normal" | "salty" | "unknown";
    spaceType: "rooftop" | "balcony" | "containers" | "backyard" | "microplot";
    sunlight: "low" | "medium" | "high";
    primaryGoal: "calories" | "nutrition" | "fast";
    experienceLevel: "beginner" | "intermediate" | "advanced";
    latitude: number | null;
    longitude: number | null;
    locationLabel: string;
}

const STEPS = [
    { id: "welcome", title: "Welcome", icon: HomeIcon },
    { id: "location", title: "Location", icon: MapPin },
    { id: "space", title: "Your Space", icon: Leaf },
    { id: "conditions", title: "Conditions", icon: Droplets },
    { id: "goals", title: "Goals", icon: Target },
    { id: "complete", title: "Complete", icon: Check },
];

const FARM_EMOJI_OPTIONS = [
    "🌱", "🌿", "🌻", "🌺", "🌷", "🌹", "🪻", "🌸",
    "🥕", "🥬", "🍅", "🌽", "🥒", "🍆", "🫑", "🧅",
    "🍎", "🍊", "🍋", "🍇", "🍓", "🫐", "🥭", "🍑",
    "🏡", "🏠", "🌳", "🌴", "🪴", "🌵", "🍀", "☘️",
];

// options will be translated inside the component. n-not like i care if you understand
const SPACE_OPTION_VALUES = ["rooftop", "balcony", "containers", "backyard", "microplot"] as const;
const SPACE_OPTION_EMOJIS: Record<typeof SPACE_OPTION_VALUES[number], string> = {
    rooftop: "🏢",
    balcony: "🏠",
    containers: "🪴",
    backyard: "🌳",
    microplot: "🌾",
};

const WATER_OPTION_VALUES = ["none", "low", "medium", "high"] as const;
const WATER_OPTION_EMOJIS: Record<typeof WATER_OPTION_VALUES[number], string> = {
    none: "🚫",
    low: "💧",
    medium: "💦",
    high: "🌊",
};

const SOIL_OPTION_VALUES = ["normal", "salty", "unknown"] as const;
const SOIL_OPTION_EMOJIS: Record<typeof SOIL_OPTION_VALUES[number], string> = {
    normal: "✅",
    salty: "🧂",
    unknown: "❓",
};

const SUN_OPTION_VALUES = ["low", "medium", "high"] as const;
const SUN_OPTION_EMOJIS: Record<typeof SUN_OPTION_VALUES[number], string> = {
    low: "🌥️",
    medium: "⛅",
    high: "☀️",
};

const GOAL_OPTION_VALUES = ["calories", "nutrition", "fast"] as const;
const GOAL_OPTION_EMOJIS: Record<typeof GOAL_OPTION_VALUES[number], string> = {
    calories: "🔥",
    nutrition: "🥗",
    fast: "⚡",
};

const EXPERIENCE_OPTION_VALUES = ["beginner", "intermediate", "advanced"] as const;
const EXPERIENCE_OPTION_EMOJIS: Record<typeof EXPERIENCE_OPTION_VALUES[number], string> = {
    beginner: "🌱",
    intermediate: "🌿",
    advanced: "🌳",
};

export function OnboardingWizard() {
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.dir() === "rtl";
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);
    const [data, setData] = useState<OnboardingData>({
        farmName: "",
        farmEmoji: "🌱",
        waterAvailability: "medium",
        soilCondition: "normal",
        spaceType: "containers",
        sunlight: "medium",
        primaryGoal: "nutrition",
        experienceLevel: "beginner",
        latitude: null,
        longitude: null,
        locationLabel: "",
    });

    // translated step labels. localization is bussin fr
    const STEPS_TRANSLATED = [
        { id: "welcome", title: t("onboarding.steps.welcome"), icon: HomeIcon },
        { id: "location", title: t("onboarding.steps.location"), icon: MapPin },
        { id: "space", title: t("onboarding.steps.space"), icon: Leaf },
        { id: "conditions", title: t("onboarding.steps.conditions"), icon: Droplets },
        { id: "goals", title: t("onboarding.steps.goals"), icon: Target },
        { id: "complete", title: t("onboarding.steps.complete"), icon: Check },
    ];

    // translated options. making it multilingual and stuff
    const SPACE_OPTIONS = SPACE_OPTION_VALUES.map((value) => ({
        value,
        emoji: SPACE_OPTION_EMOJIS[value],
        label: t(`onboarding.space.options.${value}.label`),
        desc: t(`onboarding.space.options.${value}.desc`),
    }));

    const WATER_OPTIONS = WATER_OPTION_VALUES.map((value) => ({
        value,
        emoji: WATER_OPTION_EMOJIS[value],
        label: t(`onboarding.conditions.water.options.${value}.label`),
        desc: t(`onboarding.conditions.water.options.${value}.desc`),
    }));

    const SOIL_OPTIONS = SOIL_OPTION_VALUES.map((value) => ({
        value,
        emoji: SOIL_OPTION_EMOJIS[value],
        label: t(`onboarding.conditions.soil.options.${value}.label`),
        desc: t(`onboarding.conditions.soil.options.${value}.desc`),
    }));

    const SUN_OPTIONS = SUN_OPTION_VALUES.map((value) => ({
        value,
        emoji: SUN_OPTION_EMOJIS[value],
        label: t(`onboarding.conditions.sun.options.${value}.label`),
        desc: t(`onboarding.conditions.sun.options.${value}.desc`),
    }));

    const GOAL_OPTIONS = GOAL_OPTION_VALUES.map((value) => ({
        value,
        emoji: GOAL_OPTION_EMOJIS[value],
        label: t(`onboarding.goals.options.${value}.label`),
        desc: t(`onboarding.goals.options.${value}.desc`),
    }));

    const EXPERIENCE_OPTIONS = EXPERIENCE_OPTION_VALUES.map((value) => ({
        value,
        emoji: EXPERIENCE_OPTION_EMOJIS[value],
        label: t(`onboarding.goals.experience.${value}.label`),
        desc: t(`onboarding.goals.experience.${value}.desc`),
    }));

    const updateData = (updates: Partial<OnboardingData>) => {
        setData((prev) => ({ ...prev, ...updates }));
    };

    const detectLocation = useCallback(async () => {
        setIsDetectingLocation(true);
        try {
            const coords = await getUserLocation();
            const country = await getCountryFromCoords(coords.latitude, coords.longitude);
            updateData({
                latitude: coords.latitude,
                longitude: coords.longitude,
                locationLabel: country || "Unknown location",
            });
        } catch (error) {
            console.error("Failed to detect location:", error);
        } finally {
            setIsDetectingLocation(false);
        }
    }, []);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch("/api/farm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    farmName: data.farmName,
                    farmEmoji: data.farmEmoji,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    locationLabel: data.locationLabel,
                    spaceType: data.spaceType,
                    waterAvailability: data.waterAvailability,
                    soilCondition: data.soilCondition,
                    sunlight: data.sunlight,
                    primaryGoal: data.primaryGoal,
                    experienceLevel: data.experienceLevel,
                    onboardingCompleted: true,
                }),
            });

            if (response.ok) {
                // generate the initial plan immediately so the dashboard isnt empty. cant have an empty dashboard thats lowkey embarrassing
                const planResponse = await fetch("/api/plans", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        waterAvailability: data.waterAvailability,
                        soilCondition: data.soilCondition,
                        spaceType: data.spaceType,
                        sunlight: data.sunlight,
                        primaryGoal: data.primaryGoal,
                        experienceLevel: data.experienceLevel,
                    }),
                });

                if (!planResponse.ok) {
                    console.error("Failed to generate initial plan");
                }

                router.push("/dashboard");
            } else {
                console.error("Failed to save profile");
            }
        } catch (error) {
            console.error("Error saving profile:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = () => {
        if (currentStep === STEPS.length - 1) {
            handleSubmit();
        } else {
            setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
        }
    };

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    };

    const canProceed = () => {
        switch (STEPS[currentStep].id) {
        case "welcome":
            return true;
        case "location":
            return data.latitude !== null && data.longitude !== null;
        case "space":
            return !!data.spaceType;
        case "conditions":
            return data.waterAvailability && data.soilCondition && data.sunlight;
        case "goals":
            return data.primaryGoal && data.experienceLevel;
        default:
            return true;
        }
    };

    // auto-detect location on mount. gps doing the heavy lifting
    useEffect(() => {
        if (currentStep === 1 && data.latitude === null) {
            detectLocation();
        }
    }, [currentStep, data.latitude, detectLocation]);

    // selection button component. reusable king right here
    const SelectionButton = ({ 
        selected, 
        onClick, 
        emoji, 
        label, 
        desc,
        size = "normal" 
    }: { 
        selected: boolean; 
        onClick: () => void; 
        emoji: string; 
        label: string; 
        desc: string;
        size?: "normal" | "large";
    }) => (
        <button
            type="button"
            onClick={onClick}
            className={`
                relative flex flex-col items-start rounded-xl border-2 text-left
                transition-all duration-200 cursor-pointer active:scale-[0.98]
                ${selected 
            ? "border-[#80ED99] bg-[#80ED99]/10" 
            : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-[#80ED99]/50 hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
        }
                ${size === "large" ? "p-4 sm:p-5" : "p-3 sm:p-4"}
            `}
        >
            {selected && (
                <div className="absolute right-2 top-2 sm:right-3 sm:top-3 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-[#80ED99]">
                    <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-zinc-900" />
                </div>
            )}
            <span className={size === "large" ? "text-xl sm:text-2xl mb-1 sm:mb-2" : "text-lg sm:text-xl mb-1"}>{emoji}</span>
            <span className="font-semibold text-foreground text-sm sm:text-base">{label}</span>
            <span className="text-xs text-muted-foreground mt-0.5 hidden sm:block">{desc}</span>
        </button>
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">

            <ColorBends
                colors={["#0fff83"]}
                rotation={0}
                speed={0.2}
                scale={1}
                frequency={1}
                warpStrength={1}
                mouseInfluence={1}
                parallax={0.5}
                noise={0.1}
                transparent
                autoRotate={0}
                className="fixed left-0 top-0 h-full w-full opacity-30"
            />
            

            <div className="z-10 mx-auto lg:max-w-2xl lg:min-w-2xl max-w-screen min-w-screen px-4 py-8 transition-all">
                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {STEPS_TRANSLATED.map((step, index) => {
                            const StepIcon = step.icon;
                            const isComplete = index < currentStep;
                            const isCurrent = index === currentStep;
                            
                            return (
                                <div key={step.id} className="flex flex-1 items-center">
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`
                                                flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all
                                                ${isComplete 
                                    ? "border-[#80ED99] bg-[#80ED99] text-zinc-900" 
                                    : isCurrent 
                                        ? "border-[#80ED99] text-[#80ED99]" 
                                        : "border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-muted-foreground"
                                }
                                            `}
                                        >
                                            {isComplete ? (
                                                <Check className="h-5 w-5" />
                                            ) : (
                                                <StepIcon className="h-5 w-5" />
                                            )}
                                        </div>
                                        <span className={`mt-2 text-xs font-medium hidden sm:block ${isCurrent ? "text-foreground" : "text-muted-foreground"}`}>
                                            {step.title}
                                        </span>
                                    </div>
                                    {index < STEPS_TRANSLATED.length - 1 && (
                                        <div
                                            className={`mx-2 h-0.5 flex-1 transition-colors ${
                                                isComplete ? "bg-[#80ED99]" : "bg-zinc-200 dark:bg-zinc-700"
                                            }`}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Content Card */}
                <Card className="border-zinc-200 dark:border-zinc-700 shadow-lg overflow-hidden">
                    {/* Step: Welcome */}
                    {currentStep === 0 && (
                        <div className="p-8 text-center fade-onboard-step">
                            <div className="mx-auto fades-fancy-ahh-fast mb-6 flex h-40 w-40 items-center justify-center">
                                <FadesLogo fill="var(--primary)" className="h-full w-full" />
                            </div>

                            {isRTL ? (
                                <h2 className="text-2xl font-semibold text-center fades-fancy-ahh">
                                    {t("onboarding.welcome.title")}
                                </h2>
                            ) : (
                                <SplitText
                                    text={t("onboarding.welcome.title")}
                                    className="text-2xl font-semibold text-center"
                                    duration={0.5}
                                    ease="power3.out"
                                    splitType="chars"
                                    from={{ opacity: 0, y: 40 }}
                                    to={{ opacity: 1, y: 0 }}
                                    threshold={0.1}
                                    rootMargin="-100px"
                                    textAlign="center"
                                />
                            )}

                            <p className="mt-4 text-lg text-muted-foreground max-w-md mx-auto">
                                {t("onboarding.welcome.subtitle")}
                            </p>
                        </div>
                    )}

                    {/* Step: Location */}
                    {currentStep === 1 && (
                        <div className="py-6 fade-onboard-step">
                            <div className="mb-6 text-center">
                                <h2 className="text-2xl font-bold text-foreground">{t("onboarding.location.title")}</h2>
                                <p className="mt-1 text-muted-foreground">
                                    {t("onboarding.location.subtitle")}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <LocationPickerMap
                                    latitude={data.latitude}
                                    longitude={data.longitude}
                                    onLocationSelect={async (lat, lng) => {
                                        const country = await getCountryFromCoords(lat, lng);
                                        updateData({
                                            latitude: lat,
                                            longitude: lng,
                                            locationLabel: country || "Selected location",
                                        });
                                    }}
                                />

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-foreground">
                                            {getCountryName(data.locationLabel) || "No location selected"}
                                        </p>
                                        {data.latitude && (
                                            <p className="text-xs text-muted-foreground">
                                                {data.latitude.toFixed(4)}, {data.longitude?.toFixed(4)}
                                            </p>
                                        )}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={detectLocation}
                                        disabled={isDetectingLocation}
                                        className="gap-2"
                                    >
                                        <MapPin className="h-4 w-4" />
                                        {isDetectingLocation ? t("onboarding.location.detecting") : t("onboarding.location.useMyLocation")}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step: Space */}
                    {currentStep === 2 && (
                        <div className="p-6 fade-onboard-step">
                            <div className="mb-6 text-center">
                                <h2 className="text-2xl font-bold text-foreground">{t("onboarding.space.title")}</h2>
                                <p className="mt-1 text-muted-foreground">
                                    {t("onboarding.space.subtitle")}
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-foreground">
                                        {t("onboarding.welcome.farmName")}
                                    </label>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-zinc-200 bg-zinc-50 text-2xl transition-all hover:border-[#80ED99] hover:bg-[#80ED99]/10 dark:border-zinc-700 dark:bg-zinc-800"
                                            onClick={() => {
                                                const currentIndex = FARM_EMOJI_OPTIONS.indexOf(data.farmEmoji);
                                                const nextIndex = (currentIndex + 1) % FARM_EMOJI_OPTIONS.length;
                                                updateData({ farmEmoji: FARM_EMOJI_OPTIONS[nextIndex] });
                                            }}
                                            title="Click to change icon"
                                        >
                                            {data.farmEmoji}
                                        </button>
                                        <Input
                                            value={data.farmName}
                                            onChange={(e) => updateData({ farmName: e.target.value })}
                                            placeholder={t("onboarding.welcome.farmNamePlaceholder")}
                                            className="flex-1 text-base"
                                        />
                                    </div>
                                </div>

                                {/* Emoji Grid */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-foreground">
                                        {t("onboarding.welcome.chooseEmoji")}
                                    </label>
                                    <div className="grid grid-cols-8 gap-2">
                                        {FARM_EMOJI_OPTIONS.map((emoji) => (
                                            <button
                                                key={emoji}
                                                type="button"
                                                onClick={() => updateData({ farmEmoji: emoji })}
                                                className={`
                                                    flex h-10 w-10 items-center justify-center rounded-lg text-xl transition-all
                                                    ${data.farmEmoji === emoji
                                                ? "bg-[#80ED99]"
                                                : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                                            }
                                                `}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-3 block text-sm font-medium text-foreground">
                                        {t("onboarding.space.spaceTypeLabel")}
                                    </label>
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                        {SPACE_OPTIONS.map((opt) => (
                                            <SelectionButton
                                                key={opt.value}
                                                selected={data.spaceType === opt.value}
                                                onClick={() => updateData({ spaceType: opt.value as OnboardingData["spaceType"] })}
                                                emoji={opt.emoji}
                                                label={opt.label}
                                                desc={opt.desc}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step: Conditions */}
                    {currentStep === 3 && (
                        <div className="p-6 fade-onboard-step">
                            <div className="mb-6 text-center">
                                <h2 className="text-2xl font-bold text-foreground">{t("onboarding.conditions.title")}</h2>
                                <p className="mt-1 text-muted-foreground">
                                    {t("onboarding.conditions.subtitle")}
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                                        <Droplets className="h-4 w-4 text-blue-400" />
                                        {t("onboarding.conditions.water.label")}
                                    </label>
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                        {WATER_OPTIONS.map((opt) => (
                                            <SelectionButton
                                                key={opt.value}
                                                selected={data.waterAvailability === opt.value}
                                                onClick={() => updateData({ waterAvailability: opt.value as OnboardingData["waterAvailability"] })}
                                                emoji={opt.emoji}
                                                label={opt.label}
                                                desc={opt.desc}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                                        <Leaf className="h-4 w-4 text-amber-600" />
                                        {t("onboarding.conditions.soil.label")}
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {SOIL_OPTIONS.map((opt) => (
                                            <SelectionButton
                                                key={opt.value}
                                                selected={data.soilCondition === opt.value}
                                                onClick={() => updateData({ soilCondition: opt.value as OnboardingData["soilCondition"] })}
                                                emoji={opt.emoji}
                                                label={opt.label}
                                                desc={opt.desc}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                                        <Sun className="h-4 w-4 text-yellow-500" />
                                        {t("onboarding.conditions.sun.label")}
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {SUN_OPTIONS.map((opt) => (
                                            <SelectionButton
                                                key={opt.value}
                                                selected={data.sunlight === opt.value}
                                                onClick={() => updateData({ sunlight: opt.value as OnboardingData["sunlight"] })}
                                                emoji={opt.emoji}
                                                label={opt.label}
                                                desc={opt.desc}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step: Goals */}
                    {currentStep === 4 && (
                        <div className="p-6 fade-onboard-step">
                            <div className="mb-6 text-center">
                                <h2 className="text-2xl font-bold text-foreground">{t("onboarding.goals.title")}</h2>
                                <p className="mt-1 text-muted-foreground">
                                    {t("onboarding.goals.subtitle")}
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="mb-3 block text-sm font-medium text-foreground">
                                        {t("onboarding.goals.goalLabel")}
                                    </label>
                                    <div className="grid gap-3">
                                        {GOAL_OPTIONS.map((opt) => (
                                            <SelectionButton
                                                key={opt.value}
                                                selected={data.primaryGoal === opt.value}
                                                onClick={() => updateData({ primaryGoal: opt.value as OnboardingData["primaryGoal"] })}
                                                emoji={opt.emoji}
                                                label={opt.label}
                                                desc={opt.desc}
                                                size="large"
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-3 block text-sm font-medium text-foreground">
                                        {t("onboarding.goals.experienceLabel")}
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {EXPERIENCE_OPTIONS.map((opt) => (
                                            <SelectionButton
                                                key={opt.value}
                                                selected={data.experienceLevel === opt.value}
                                                onClick={() => updateData({ experienceLevel: opt.value as OnboardingData["experienceLevel"] })}
                                                emoji={opt.emoji}
                                                label={opt.label}
                                                desc={opt.desc}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step: Complete */}
                    {currentStep === 5 && (
                        <div className="p-8 text-center fade-onboard-step">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#80ED99]/20">
                                <Check className="h-10 w-10 text-[#80ED99]" />
                            </div>
                            <h2 className="text-3xl font-bold text-foreground">
                                {t("onboarding.complete.title")}
                            </h2>
                            <p className="mt-4 text-lg text-muted-foreground max-w-md mx-auto">
                                {t("onboarding.complete.subtitle")}
                            </p>
                            
                            <div className="mt-8 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 p-6 text-left">
                                <h3 className="font-semibold text-foreground mb-4">{t("profile.title")}</h3>
                                <div className="grid gap-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t("onboarding.welcome.farmName")}</span>
                                        <span className="font-medium">{data.farmName || t("onboarding.welcome.randomFarmName")}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t("onboarding.location.yourLocation")}</span>
                                        <span className="font-medium">{getCountryName(data.locationLabel)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t("onboarding.space.spaceTypeLabel")}</span>
                                        <span className="font-medium">{SPACE_OPTIONS.find(o => o.value === data.spaceType)?.label}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t("onboarding.goals.goalLabel")}</span>
                                        <span className="font-medium">{GOAL_OPTIONS.find(o => o.value === data.primaryGoal)?.label}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between">
                        <Button
                            variant="ghost"
                            onClick={prevStep}
                            disabled={currentStep === 0}
                            className="gap-2"
                        >
                            {isRTL ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                            {t("onboarding.navigation.back")}
                        </Button>
                        <Button
                            onClick={nextStep}
                            disabled={!canProceed() || isSubmitting}
                            className="gap-2 bg-[#80ED99] text-zinc-900 hover:bg-[#80ED99]/90"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
                                    {t("onboarding.complete.creating")}
                                </>
                            ) : currentStep === STEPS.length - 1 ? (
                                <>
                                    {t("onboarding.complete.goToDashboard")}
                                </>
                            ) : (
                                <>
                                    {t("onboarding.welcome.continue")}
                                    {isRTL ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                                </>
                            )}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
