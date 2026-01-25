// Exchange feature constants

import type { DeliveryMethodOption } from "./types";

export const DELIVERY_METHODS: DeliveryMethodOption[] = [
  { value: "pickup", label: "Pick-up at location", emoji: "📍" },
  { value: "walking", label: "Walking delivery", emoji: "🚶" },
  { value: "bicycle", label: "Bicycle delivery", emoji: "🚲" },
  { value: "car", label: "Car delivery", emoji: "🚗" },
  { value: "truck", label: "Truck delivery", emoji: "🚚" },
  { value: "boat", label: "Boat/Water transport", emoji: "🚤" },
  { value: "drone", label: "Drone delivery", emoji: "🛸" },
  { value: "helicopter", label: "Helicopter/Care package", emoji: "🚁" },
  { value: "airdrop", label: "Emergency airdrop", emoji: "🪂" },
];

export const LISTING_TYPE_OPTIONS = [
  { value: "", label: "All" },
  { value: "seeds", label: "🌱 Seeds" },
  { value: "produce", label: "🥬 Produce" },
  { value: "fertilizer", label: "🌿 Fertilizer" },
  { value: "tools", label: "🔧 Tools" },
  { value: "other", label: "📦 Other" },
] as const;

export const LISTING_STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "available", label: "Available" },
  { value: "claimed", label: "Claimed" },
  { value: "completed", label: "Completed" },
] as const;

export const LISTING_MODE_OPTIONS = [
  { value: "", label: "All" },
  { value: "offering", label: "Offering" },
  { value: "seeking", label: "Seeking" },
] as const;

export const TYPE_COLORS: Record<string, string> = {
  seeds: "bg-green-500 text-white",
  produce: "bg-amber-500 text-white",
  tools: "bg-blue-500 text-white",
  fertilizer: "bg-emerald-600 text-white",
  other: "bg-gray-500 text-white",
};

export const STATUS_COLORS: Record<string, string> = {
  available: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  claimed: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  completed: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export const DEFAULT_CREATE_FORM = {
  mode: "offering" as const,
  type: "seeds" as const,
  plantId: "",
  title: "",
  description: "",
  quantity: "",
  dealType: "donation" as const,
  price: "",
  tradeItems: [] as string[],
  newTradeItem: "",
  deliveryMethod: "pickup" as const,
};
