// profile feature constants. the identity constants

export const SPACE_TYPE_OPTIONS = [
    { value: "rooftop", label: "🏢 Rooftop" },
    { value: "balcony", label: "🏠 Balcony" },
    { value: "containers", label: "🪴 Containers" },
    { value: "backyard", label: "🌳 Backyard" },
    { value: "microplot", label: "🌾 Microplot" },
] as const;

export const EXPERIENCE_LEVEL_OPTIONS = [
    { value: "beginner", label: "🌱 Beginner" },
    { value: "intermediate", label: "🌿 Intermediate" },
    { value: "advanced", label: "🌳 Advanced" },
] as const;

export const WATER_AVAILABILITY_OPTIONS = [
    { value: "none", label: "None" },
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
] as const;

export const SOIL_CONDITION_OPTIONS = [
    { value: "normal", label: "Normal" },
    { value: "salty", label: "Salty" },
    { value: "unknown", label: "Unknown" },
] as const;

export const SUNLIGHT_OPTIONS = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
] as const;
