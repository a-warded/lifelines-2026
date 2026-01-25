// Compost feature constants

import type { AddSiteForm, WasteFormEntry } from "./types";

export const DEFAULT_WASTE_ENTRY: WasteFormEntry = {
  id: "1",
  wasteType: "",
  amountKg: 0,
};

export const DEFAULT_SITE_FORM: AddSiteForm = {
  siteName: "",
  siteType: "private",
  description: "",
  acceptsWaste: true,
  sellsFertilizer: false,
  capacityKg: "",
  contactInfo: "",
};

export const SITE_TYPE_OPTIONS = [
  { value: "private", label: "🏠 Private (Your property)" },
  { value: "community", label: "👥 Community (Shared space)" },
  { value: "commercial", label: "🏢 Commercial (Business)" },
  { value: "municipal", label: "🏛️ Municipal (City-run)" },
] as const;
