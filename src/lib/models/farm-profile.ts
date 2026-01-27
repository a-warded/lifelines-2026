import mongoose, { Document, Model, Schema } from "mongoose";
import { GrowthStage } from "../plants";

// crop entry for tracking whats growing in the farm. n-not like i care about your garden
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
    
    // farm details - tell me about your goofy ahh garden
    farmName?: string;
    farmEmoji?: string;
    waterAvailability: "none" | "low" | "medium" | "high";
    soilCondition: "normal" | "salty" | "unknown";
    spaceType: "rooftop" | "balcony" | "containers" | "backyard" | "microplot";
    sunlight: "low" | "medium" | "high";
    primaryGoal: "calories" | "nutrition" | "fast";
    experienceLevel?: "beginner" | "intermediate" | "advanced";
    
    // location - where the magic happens
    latitude: number;
    longitude: number;
    locationLabel?: string;
    country?: string;
    
    // crops currently growing - lowkey exciting
    crops: ICropEntry[];
    
    // calculated water needs (updated when crops change). hydration check
    dailyWaterLiters: number;
    
    // visibility settings - who can see your farm
    isPublic: boolean;
    
    // onboarding completion - did you finish setting up
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
        
        // location fields - bruh where you farming
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        locationLabel: { type: String },
        country: { type: String },
        
        // crops - the good stuff
        crops: { type: [CropEntrySchema], default: [] },
        dailyWaterLiters: { type: Number, default: 0 },
        
        // settings - lowkey important
        isPublic: { type: Boolean, default: true },
        onboardingCompleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// geospatial index for location-based queries. gotta go fast
FarmProfileSchema.index({ latitude: 1, longitude: 1 });
FarmProfileSchema.index({ country: 1, isPublic: 1 });

export const FarmProfile: Model<IFarmProfile> =
    mongoose.models.FarmProfile ||
    mongoose.model<IFarmProfile>("FarmProfile", FarmProfileSchema);
