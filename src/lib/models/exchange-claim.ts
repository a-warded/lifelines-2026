import mongoose, { Document, Model, Schema } from "mongoose";

export interface IExchangeClaim extends Document {
  listingId: string;
  ownerId: string;
  claimerId?: string;
  claimerName: string;
  claimerContact: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const ExchangeClaimSchema = new Schema<IExchangeClaim>(
    {
        listingId: { type: String, required: true, index: true },
        ownerId: { type: String, required: true },
        claimerId: { type: String, required: false },
        claimerName: { type: String, required: true },
        claimerContact: { type: String, required: true },
        status: {
            type: String,
            enum: ["pending", "confirmed", "completed", "cancelled"],
            default: "pending",
        },
    },
    { timestamps: true }
);

export const ExchangeClaim: Model<IExchangeClaim> =
  mongoose.models.ExchangeClaim ||
  mongoose.model<IExchangeClaim>("ExchangeClaim", ExchangeClaimSchema);
