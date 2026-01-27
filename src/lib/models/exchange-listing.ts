import mongoose, { Document, Model, Schema } from "mongoose";

export type ListingType = "seeds" | "produce" | "tools" | "fertilizer" | "other";
export type ListingMode = "offering" | "seeking";
export type DealType = "price" | "trade" | "donation";
export type ListingStatus = "available" | "claimed" | "completed" | "cancelled";
export type DeliveryMethod = "pickup" | "walking" | "bicycle" | "car" | "truck" | "boat" | "drone" | "helicopter" | "airdrop";

export interface IExchangeListing extends Document {
    userId: string;
    userName?: string;
    
    // what theyre listing - lowkey important info
    type: ListingType;
    plantId?: string; // reference to plant from central database. the plant link
    title: string;
    description: string;
    quantity?: string; // Free-form: "50 seeds", "2 kg", etc.
    imageUrl?: string; // Optional image URL for the listing
    
    // mode: offering something or looking for something. sharing is caring or whatever
    mode: ListingMode;
    
    // deal type - whats the vibe
    dealType: DealType;
    price?: number; // only for dealType === "price". show me the money
    currencyCountry?: string; // ISO country code for currency display
    tradeItems?: string[]; // Items wanted in exchange for dealType === "trade"
    
    // delivery method - how you gonna get it there bestie
    deliveryMethod?: DeliveryMethod;
    
    // location - bruh where you at
    latitude?: number;
    longitude?: number;
    country: string; // ISO country code
    locationLabel?: string; // Human-readable location
    
    // status - whats the situation
    status: ListingStatus;
    
    createdAt: Date;
    updatedAt: Date;
}

const ExchangeListingSchema = new Schema<IExchangeListing>(
    {
        userId: { type: String, required: true, index: true },
        userName: { type: String },
        
        type: {
            type: String,
            enum: ["seeds", "produce", "tools", "fertilizer", "other"],
            required: true,
        },
        plantId: { type: String },
        title: { type: String, required: true },
        description: { type: String, required: true, maxlength: 1000 },
        quantity: { type: String },
        imageUrl: { type: String },
        
        mode: {
            type: String,
            enum: ["offering", "seeking"],
            default: "offering",
        },
        
        dealType: {
            type: String,
            enum: ["price", "trade", "donation"],
            default: "donation",
        },
        price: { type: Number, min: 0 },
        currencyCountry: { type: String },
        tradeItems: [{ type: String }],
        
        deliveryMethod: {
            type: String,
            enum: ["pickup", "walking", "bicycle", "car", "truck", "boat", "drone", "helicopter", "airdrop"],
            default: "pickup",
        },
        
        latitude: { type: Number },
        longitude: { type: Number },
        country: { type: String, required: true, index: true },
        locationLabel: { type: String },
        
        status: {
            type: String,
            enum: ["available", "claimed", "completed", "cancelled"],
            default: "available",
        },
    },
    { timestamps: true }
);

// indexes for efficient querying. gotta go fast bestie
ExchangeListingSchema.index({ type: 1, status: 1 });
ExchangeListingSchema.index({ country: 1, status: 1 });
ExchangeListingSchema.index({ latitude: 1, longitude: 1 });
ExchangeListingSchema.index({ mode: 1, status: 1 });

export const ExchangeListing: Model<IExchangeListing> =
    mongoose.models.ExchangeListing ||
    mongoose.model<IExchangeListing>("ExchangeListing", ExchangeListingSchema);
