import mongoose, { Document, Model, Schema } from "mongoose";

export interface IExchangeClaim extends Document {
  listingId: string;
  ownerId: string;
  claimerId: string;
  claimerName?: string;
  message?: string;
  tradeOffer?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const ExchangeClaimSchema = new Schema<IExchangeClaim>(
    {
        listingId: { type: String, required: true, index: true },
        ownerId: { type: String, required: true },
        claimerId: { type: String, required: true },
        claimerName: { type: String },
        message: { type: String },
        tradeOffer: { type: String },
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
