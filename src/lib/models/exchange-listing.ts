import mongoose, { Document, Model, Schema } from "mongoose";

export interface IExchangeListing extends Document {
  userId: string;
  type: "seed" | "surplus" | "tool";
  title: string;
  description: string;
  quantity: number;
  unit: string;
  condition?: "fresh" | "unknown" | "old";
  locationArea: string;
  contact: string;
  status: "open" | "claimed" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const ExchangeListingSchema = new Schema<IExchangeListing>(
    {
        userId: { type: String, required: true, index: true },
        type: {
            type: String,
            enum: ["seed", "surplus", "tool"],
            required: true,
        },
        title: { type: String, required: true },
        description: { type: String, required: true, maxlength: 500 },
        quantity: { type: Number, required: true, min: 1 },
        unit: { type: String, required: true },
        condition: {
            type: String,
            enum: ["fresh", "unknown", "old"],
            required: false,
        },
        locationArea: { type: String, required: true },
        contact: { type: String, required: true },
        status: {
            type: String,
            enum: ["open", "claimed", "completed", "cancelled"],
            default: "open",
        },
    },
    { timestamps: true }
);

// Compound index for filtering
ExchangeListingSchema.index({ type: 1, status: 1 });

export const ExchangeListing: Model<IExchangeListing> =
  mongoose.models.ExchangeListing ||
  mongoose.model<IExchangeListing>("ExchangeListing", ExchangeListingSchema);
