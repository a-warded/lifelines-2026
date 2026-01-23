import mongoose, { Document, Model, Schema } from "mongoose";

export interface IFarmProfile extends Document {
  userId: string;
  waterAvailability: "none" | "low" | "medium" | "high";
  soilCondition: "normal" | "salty" | "unknown";
  spaceType: "rooftop" | "balcony" | "containers" | "backyard" | "microplot";
  sunlight: "low" | "medium" | "high";
  primaryGoal: "calories" | "nutrition" | "fast";
  experienceLevel?: "beginner" | "intermediate" | "advanced";
  createdAt: Date;
  updatedAt: Date;
}

const FarmProfileSchema = new Schema<IFarmProfile>(
    {
        userId: { type: String, required: true, index: true },
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
    },
    { timestamps: true }
);

export const FarmProfile: Model<IFarmProfile> =
  mongoose.models.FarmProfile ||
  mongoose.model<IFarmProfile>("FarmProfile", FarmProfileSchema);
