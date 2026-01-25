// Profile feature type definitions

export interface FarmProfileData {
  farmName?: string;
  waterAvailability: string;
  soilCondition: string;
  spaceType: string;
  sunlight: string;
  primaryGoal: string;
  experienceLevel?: string;
  latitude: number;
  longitude: number;
  locationLabel?: string;
  country?: string;
  isPublic: boolean;
  dailyWaterLiters: number;
  crops: Array<{ plantName: string; count: number }>;
}

export type EditableProfileData = Partial<FarmProfileData>;
