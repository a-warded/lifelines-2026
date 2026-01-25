// Map feature type definitions

export interface Farm {
  userId: string;
  userName?: string;
  farmName?: string;
  farmEmoji?: string;
  latitude: number;
  longitude: number;
  locationLabel?: string;
  country?: string;
  crops: Array<{ plantName: string; count: number }>;
  spaceType: string;
  dailyWaterLiters: number;
}

export interface CompostSite {
  id: string;
  userId: string;
  userName?: string;
  siteName: string;
  siteEmoji?: string;
  siteType: string;
  description?: string;
  acceptsWaste: boolean;
  sellsFertilizer: boolean;
  latitude: number;
  longitude: number;
  locationLabel?: string;
  country?: string;
  distance?: number;
}

export interface FarmProfile {
  latitude: number;
  longitude: number;
}

export type MapLayer = "farms" | "compost" | "all";

export interface MapStats {
  totalFarms: number;
  totalCompostSites: number;
  totalCrops: number;
  totalPlants: number;
}
