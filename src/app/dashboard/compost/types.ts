// compost feature type definitions. trash types fr
import type { CompostResult } from "@/lib/logic/compost-calculator";
import type { TFunction } from "i18next";

export type TranslateFunction = TFunction<"translation", undefined>;

export interface WasteFormEntry {
  id: string;
  wasteType: WasteType | "";
  amountKg: number;
}

export type WasteType =
  | "crop_residue"
  | "fruit_waste"
  | "vegetable_waste"
  | "grass_clippings"
  | "leaves"
  | "manure"
  | "food_scraps"
  | "sawdust"
  | "straw"
  | "coffee_grounds";

export interface CompostSite {
  id: string;
  siteName: string;
  siteEmoji?: string;
  siteType: "community" | "private" | "commercial" | "municipal";
  distance?: number;
  acceptsWaste: boolean;
  sellsFertilizer: boolean;
  locationLabel?: string;
  description?: string;
  capacityKg?: number;
  contactInfo?: string;
}

export interface AddSiteForm {
  siteName: string;
  siteType: "community" | "private" | "commercial" | "municipal";
  description: string;
  acceptsWaste: boolean;
  sellsFertilizer: boolean;
  capacityKg: string;
  contactInfo: string;
}

export interface CompostLocation {
  lat: number;
  lng: number;
}

export { CompostResult };

