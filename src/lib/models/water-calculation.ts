import mongoose, { Document, Model, Schema } from "mongoose";

export interface IWaterCalculation extends Document {
  userId: string;
  cropType: string;
  numberOfPlants: number;
  growthStage: "seedling" | "growing" | "fruiting";
  waterAvailability: "none" | "low" | "medium" | "high";
  dailyLiters: number;
  weeklyLiters: number;
  survivalDailyLiters: number;
  warnings: string[];
  createdAt: Date;
  updatedAt: Date;
}

const WaterCalculationSchema = new Schema<IWaterCalculation>(
    {
        userId: { type: String, required: true, index: true },
        cropType: { type: String, required: true },
        numberOfPlants: { type: Number, required: true, min: 1 },
        growthStage: {
            type: String,
            enum: ["seedling", "growing", "fruiting"],
            required: true,
        },
        waterAvailability: {
            type: String,
            enum: ["none", "low", "medium", "high"],
            required: true,
        },
        dailyLiters: { type: Number, required: true },
        weeklyLiters: { type: Number, required: true },
        survivalDailyLiters: { type: Number, required: true },
        warnings: [{ type: String }],
    },
    { timestamps: true }
);

export const WaterCalculation: Model<IWaterCalculation> =
  mongoose.models.WaterCalculation ||
  mongoose.model<IWaterCalculation>("WaterCalculation", WaterCalculationSchema);
