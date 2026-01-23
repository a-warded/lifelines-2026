import mongoose, { Document, Model, Schema } from "mongoose";

export type GrowthStage = "seedling" | "vegetative" | "flowering" | "fruiting" | "mature";

export interface WaterEntry {
  plantId: string;
  stage: GrowthStage;
  count: number;
}

export interface WaterResult {
  plantId: string;
  plantName: string;
  stage: GrowthStage;
  count: number;
  litersPerPlant: number;
  totalLiters: number;
}

export interface IWaterCalculation extends Document {
  userId: string;
  entries: WaterEntry[];
  totalLitersPerDay: number;
  results: WaterResult[];
  tips: string[];
  createdAt: Date;
  updatedAt: Date;
}

const WaterEntrySchema = new Schema({
    plantId: { type: String, required: true },
    stage: { 
        type: String, 
        enum: ["seedling", "vegetative", "flowering", "fruiting", "mature"],
        required: true 
    },
    count: { type: Number, required: true, min: 1 },
}, { _id: false });

const WaterResultSchema = new Schema({
    plantId: { type: String, required: true },
    plantName: { type: String, required: true },
    stage: { 
        type: String, 
        enum: ["seedling", "vegetative", "flowering", "fruiting", "mature"],
        required: true 
    },
    count: { type: Number, required: true },
    litersPerPlant: { type: Number, required: true },
    totalLiters: { type: Number, required: true },
}, { _id: false });

const WaterCalculationSchema = new Schema<IWaterCalculation>(
    {
        userId: { type: String, required: true, index: true },
        entries: [WaterEntrySchema],
        totalLitersPerDay: { type: Number, required: true },
        results: [WaterResultSchema],
        tips: [{ type: String }],
    },
    { timestamps: true }
);

export const WaterCalculation: Model<IWaterCalculation> =
  mongoose.models.WaterCalculation ||
  mongoose.model<IWaterCalculation>("WaterCalculation", WaterCalculationSchema);
