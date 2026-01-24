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
  farmProfileId?: string;
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
        // Optional: allows a placeholder plan to exist before onboarding creates a farm profile.
        farmProfileId: { type: String, required: false },
        recommendedCrops: { type: [RecommendedCropSchema], default: [] },
        timeline: { type: [TimelineBlockSchema], default: [] },
        setupChecklist: { type: [{ type: String }], default: [] },
        estimatedDailyWaterLiters: { type: Number, default: 0 },
        fallbackNotes: { type: String, default: "" },
    },
    { timestamps: true }
);

export const Plan: Model<IPlan> =
  mongoose.models.Plan || mongoose.model<IPlan>("Plan", PlanSchema);
