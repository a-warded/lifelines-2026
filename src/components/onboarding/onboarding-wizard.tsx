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
import ColorBends from "../ColorBends";
import { FadesLogo } from "../fades-logo";
import SplitText from "../SplitText";

// Dynamically import the map to avoid SSR issues
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

const SPACE_OPTIONS = [
    { value: "rooftop", emoji: "🏢", label: "Rooftop", desc: "Open roof space" },
    { value: "balcony", emoji: "🏠", label: "Balcony", desc: "Apartment balcony" },
    { value: "containers", emoji: "🪴", label: "Containers", desc: "Pots & planters" },
    { value: "backyard", emoji: "🌳", label: "Backyard", desc: "Ground garden" },
    { value: "microplot", emoji: "🌾", label: "Microplot", desc: "Small land plot" },
];

const WATER_OPTIONS = [
    { value: "none", emoji: "🚫", label: "None", desc: "Very limited access" },
    { value: "low", emoji: "💧", label: "Low", desc: "Occasional watering" },
    { value: "medium", emoji: "💦", label: "Medium", desc: "Regular watering" },
    { value: "high", emoji: "🌊", label: "High", desc: "Abundant supply" },
];

const SOIL_OPTIONS = [
    { value: "normal", emoji: "✅", label: "Normal", desc: "Good quality soil" },
    { value: "salty", emoji: "🧂", label: "Salty", desc: "High salinity" },
    { value: "unknown", emoji: "❓", label: "Unknown", desc: "Not sure" },
];

const SUN_OPTIONS = [
    { value: "low", emoji: "🌥️", label: "Low", desc: "Less than 4 hours" },
    { value: "medium", emoji: "⛅", label: "Medium", desc: "4-6 hours" },
    { value: "high", emoji: "☀️", label: "High", desc: "6+ hours" },
];

const GOAL_OPTIONS = [
    { value: "calories", emoji: "🔥", label: "Maximum Calories", desc: "Grow filling, calorie-dense crops" },
    { value: "nutrition", emoji: "🥗", label: "Balanced Nutrition", desc: "Variety of vitamins & minerals" },
    { value: "fast", emoji: "⚡", label: "Quick Harvest", desc: "Fast-growing crops first" },
];

const EXPERIENCE_OPTIONS = [
    { value: "beginner", emoji: "🌱", label: "Beginner", desc: "Just starting out" },
    { value: "intermediate", emoji: "🌿", label: "Intermediate", desc: "Some experience" },
    { value: "advanced", emoji: "🌳", label: "Advanced", desc: "Experienced grower" },
];

export function OnboardingWizard() {
    const router = useRouter();
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
                // Generate the initial plan immediately so the dashboard isn't empty.
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
            return data.spaceType && data.farmName.trim().length > 0;
        case "conditions":
            return data.waterAvailability && data.soilCondition && data.sunlight;
        case "goals":
            return data.primaryGoal && data.experienceLevel;
        default:
            return true;
        }
    };

    // Auto-detect location on mount
    useEffect(() => {
        if (currentStep === 1 && data.latitude === null) {
            detectLocation();
        }
    }, [currentStep, data.latitude, detectLocation]);

    // Selection button component
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
                ${size === "large" ? "p-5" : "p-4"}
            `}
        >
            {selected && (
                <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#80ED99]">
                    <Check className="h-3 w-3 text-zinc-900" />
                </div>
            )}
            <span className={size === "large" ? "text-2xl mb-2" : "text-xl mb-1"}>{emoji}</span>
            <span className="font-semibold text-foreground">{label}</span>
            <span className="text-xs text-muted-foreground mt-0.5">{desc}</span>
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
                        {STEPS.map((step, index) => {
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
                                    {index < STEPS.length - 1 && (
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

                            <SplitText
                                text="Welcome to FADES"
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

                            <p className="mt-4 text-lg text-muted-foreground max-w-md mx-auto">
                                Set up your profile so we can help you grow the most efficient crops for your situation.
                            </p>
                        </div>
                    )}

                    {/* Step: Location */}
                    {currentStep === 1 && (
                        <div className="py-6 fade-onboard-step">
                            <div className="mb-6 text-center">
                                <h2 className="text-2xl font-bold text-foreground">Your Location</h2>
                                <p className="mt-1 text-muted-foreground">
                                    Farm together with your local community to build a resilient food supply, immune to disruptions.
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
                                        {isDetectingLocation ? "Detecting..." : "Auto-detect"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step: Space */}
                    {currentStep === 2 && (
                        <div className="p-6 fade-onboard-step">
                            <div className="mb-6 text-center">
                                <h2 className="text-2xl font-bold text-foreground">Your Growing Space</h2>
                                <p className="mt-1 text-muted-foreground">
                                    Tell us about where you&apos;ll grow
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-foreground">
                                        Give your farm a name
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
                                            placeholder="eg: Aura Farm"
                                            className="flex-1 text-base"
                                        />
                                    </div>
                                </div>

                                {/* Emoji Grid */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-foreground">
                                        Choose a farm icon
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
                                        What type of space do you have?
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
                                <h2 className="text-2xl font-bold text-foreground">Growing Conditions</h2>
                                <p className="mt-1 text-muted-foreground">
                                    Help us understand your environment
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                                        <Droplets className="h-4 w-4 text-blue-400" />
                                        Water Availability
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
                                        Soil Condition
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
                                        Daily Sunlight
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
                                <h2 className="text-2xl font-bold text-foreground">Your Goals</h2>
                                <p className="mt-1 text-muted-foreground">
                                    What do you want to achieve?
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="mb-3 block text-sm font-medium text-foreground">
                                        Primary growing goal
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
                                        Your experience level
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
                                You&apos;re All Set
                            </h2>
                            <p className="mt-4 text-lg text-muted-foreground max-w-md mx-auto">
                                Let&apos;s start rebuilding a resilient food system, one farm at a time.
                            </p>
                            
                            <div className="mt-8 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 p-6 text-left">
                                <h3 className="font-semibold text-foreground mb-4">Your Profile Summary</h3>
                                <div className="grid gap-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Farm Name</span>
                                        <span className="font-medium">{data.farmName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Location</span>
                                        <span className="font-medium">{getCountryName(data.locationLabel)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Space Type</span>
                                        <span className="font-medium capitalize">{data.spaceType}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Primary Goal</span>
                                        <span className="font-medium capitalize">{data.primaryGoal}</span>
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
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                        <Button
                            onClick={nextStep}
                            disabled={!canProceed() || isSubmitting}
                            className="gap-2 bg-[#80ED99] text-zinc-900 hover:bg-[#80ED99]/90"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
                                    Saving...
                                </>
                            ) : currentStep === STEPS.length - 1 ? (
                                <>
                                    Get Started
                                </>
                            ) : (
                                <>
                                    Continue
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
