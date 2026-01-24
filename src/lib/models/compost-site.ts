import mongoose, { Document, Model, Schema } from "mongoose";

export type CompostSiteType = "community" | "private" | "commercial" | "municipal";

export interface ICompostSite extends Document {
    userId: string;
    userName?: string;
    
    // Site details
    siteName: string;
    siteEmoji?: string;
    description?: string;
    siteType: CompostSiteType;
    
    // What they accept
    acceptsWaste: boolean; // Accept waste from others
    sellsFertilizer: boolean; // Has fertilizer available
    
    // Capacity info
    capacityKg?: number; // Max capacity in kg
    currentLoadKg?: number; // Current load
    
    // Contact
    contactInfo?: string;
    
    // Location
    latitude: number;
    longitude: number;
    locationLabel?: string;
    country?: string;
    
    // Visibility
    isPublic: boolean;
    isVerified: boolean;
    
    createdAt: Date;
    updatedAt: Date;
}

const CompostSiteSchema = new Schema<ICompostSite>(
    {
        userId: { type: String, required: true, index: true },
        userName: { type: String },
        
        siteName: { type: String, required: true, maxlength: 100 },
        siteEmoji: { type: String, maxlength: 10, default: "♻️" },
        description: { type: String, maxlength: 500 },
        siteType: {
            type: String,
            enum: ["community", "private", "commercial", "municipal"],
            required: true,
        },
        
        acceptsWaste: { type: Boolean, default: true },
        sellsFertilizer: { type: Boolean, default: false },
        
        capacityKg: { type: Number, min: 0 },
        currentLoadKg: { type: Number, min: 0, default: 0 },
        
        contactInfo: { type: String, maxlength: 200 },
        
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        locationLabel: { type: String },
        country: { type: String, index: true },
        
        isPublic: { type: Boolean, default: true },
        isVerified: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Indexes
CompostSiteSchema.index({ latitude: 1, longitude: 1 });
CompostSiteSchema.index({ country: 1, isPublic: 1 });
CompostSiteSchema.index({ siteType: 1 });

export const CompostSite: Model<ICompostSite> =
    mongoose.models.CompostSite ||
    mongoose.model<ICompostSite>("CompostSite", CompostSiteSchema);
