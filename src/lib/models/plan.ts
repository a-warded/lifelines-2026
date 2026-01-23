import mongoose, { Document, Model, Schema } from "mongoose";

export interface IRecommendedCrop {
  cropName: string;
  reason: string;
  difficulty: "easy" | "medium" | "hard";
  timeToHarvestDays: number;
}

export interface ITimelineBlock {
  label: "Today" | "This Week" | "Week 2+";
  steps: string[];
}

export interface IPlan extends Document {
  userId: string;
  farmProfileId: string;
  recommendedCrops: IRecommendedCrop[];
  timeline: ITimelineBlock[];
  setupChecklist: string[];
  estimatedDailyWaterLiters: number;
  fallbackNotes: string;
  createdAt: Date;
  updatedAt: Date;
}

const RecommendedCropSchema = new Schema<IRecommendedCrop>(
    {
        cropName: { type: String, required: true },
        reason: { type: String, required: true },
        difficulty: {
            type: String,
            enum: ["easy", "medium", "hard"],
            required: true,
        },
        timeToHarvestDays: { type: Number, required: true },
    },
    { _id: false }
);

const TimelineBlockSchema = new Schema<ITimelineBlock>(
    {
        label: {
            type: String,
            enum: ["Today", "This Week", "Week 2+"],
            required: true,
        },
        steps: [{ type: String }],
    },
    { _id: false }
);

const PlanSchema = new Schema<IPlan>(
    {
        userId: { type: String, required: true, index: true },
        farmProfileId: { type: String, required: true },
        recommendedCrops: [RecommendedCropSchema],
        timeline: [TimelineBlockSchema],
        setupChecklist: [{ type: String }],
        estimatedDailyWaterLiters: { type: Number, required: true },
        fallbackNotes: { type: String, default: "" },
    },
    { timestamps: true }
);

export const Plan: Model<IPlan> =
  mongoose.models.Plan || mongoose.model<IPlan>("Plan", PlanSchema);
