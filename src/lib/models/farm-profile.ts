import mongoose, { Document, Model, Schema } from "mongoose";
import { GrowthStage } from "../plants";

// Crop entry for tracking what's growing in the farm
export interface ICropEntry {
    plantId: string;
    plantName: string;
    count: number;
    stage: GrowthStage;
    plantedDate?: Date;
    notes?: string;
}

export interface IFarmProfile extends Document {
    userId: string;
    userName?: string;
    
    // Farm details
    farmName?: string;
    farmEmoji?: string;
    waterAvailability: "none" | "low" | "medium" | "high";
    soilCondition: "normal" | "salty" | "unknown";
    spaceType: "rooftop" | "balcony" | "containers" | "backyard" | "microplot";
    sunlight: "low" | "medium" | "high";
    primaryGoal: "calories" | "nutrition" | "fast";
    experienceLevel?: "beginner" | "intermediate" | "advanced";
    
    // Location
    latitude: number;
    longitude: number;
    locationLabel?: string;
    country?: string;
    
    // Crops currently growing
    crops: ICropEntry[];
    
    // Calculated water needs (updated when crops change)
    dailyWaterLiters: number;
    
    // Visibility settings
    isPublic: boolean;
    
    // Onboarding completion
    onboardingCompleted: boolean;
    
    createdAt: Date;
    updatedAt: Date;
}

const CropEntrySchema = new Schema<ICropEntry>(
    {
        plantId: { type: String, required: true },
        plantName: { type: String, required: true },
        count: { type: Number, required: true, min: 1 },
        stage: {
            type: String,
            enum: ["seedling", "vegetative", "flowering", "fruiting", "mature"],
            default: "seedling",
        },
        plantedDate: { type: Date },
        notes: { type: String, maxlength: 500 },
    },
    { _id: false }
);

const FarmProfileSchema = new Schema<IFarmProfile>(
    {
        userId: { type: String, required: true, unique: true, index: true },
        userName: { type: String },
        
        farmName: { type: String, maxlength: 100 },
        farmEmoji: { type: String, maxlength: 10, default: "🌱" },
        waterAvailability: {
            type: String,
            enum: ["none", "low", "medium", "high"],
            required: true,
        },
        soilCondition: {
            type: String,
            enum: ["normal", "salty", "unknown"],
            required: true,
        },
        spaceType: {
            type: String,
            enum: ["rooftop", "balcony", "containers", "backyard", "microplot"],
            required: true,
        },
        sunlight: {
            type: String,
            enum: ["low", "medium", "high"],
            required: true,
        },
        primaryGoal: {
            type: String,
            enum: ["calories", "nutrition", "fast"],
            required: true,
        },
        experienceLevel: {
            type: String,
            enum: ["beginner", "intermediate", "advanced"],
            required: false,
        },
        
        // Location fields
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        locationLabel: { type: String },
        country: { type: String },
        
        // Crops
        crops: { type: [CropEntrySchema], default: [] },
        dailyWaterLiters: { type: Number, default: 0 },
        
        // Settings
        isPublic: { type: Boolean, default: true },
        onboardingCompleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Geospatial index for location-based queries
FarmProfileSchema.index({ latitude: 1, longitude: 1 });
FarmProfileSchema.index({ country: 1, isPublic: 1 });

export const FarmProfile: Model<IFarmProfile> =
    mongoose.models.FarmProfile ||
    mongoose.model<IFarmProfile>("FarmProfile", FarmProfileSchema);
