import mongoose, { Document, Model, Schema } from "mongoose";

export type PostCategory = "composting" | "water-saving" | "seed-saving" | "crop-rotation" | "organic" | "zero-waste" | "general";

export interface IForumPost extends Document {
    userId: string;
    userName?: string;
    
    // post content
    title: string;
    content: string;
    category: PostCategory;
    
    // the journey - seed to seed philosophy
    journeyStage?: "seed" | "growing" | "harvest" | "compost" | "full-cycle";
    
    // engagement
    likes: string[]; // array of userIds who liked
    commentCount: number;
    
    // media
    imageUrl?: string;
    
    // location context
    country?: string;
    region?: string;
    
    // status
    isPinned: boolean;
    isVerified: boolean; // community-verified sustainable practice
    
    createdAt: Date;
    updatedAt: Date;
}

export interface IForumComment extends Document {
    postId: string;
    userId: string;
    userName?: string;
    content: string;
    likes: string[];
    createdAt: Date;
    updatedAt: Date;
}

const ForumPostSchema = new Schema<IForumPost>(
    {
        userId: { type: String, required: true, index: true },
        userName: { type: String },
        
        title: { type: String, required: true, maxlength: 200 },
        content: { type: String, required: true, maxlength: 5000 },
        category: {
            type: String,
            enum: ["composting", "water-saving", "seed-saving", "crop-rotation", "organic", "zero-waste", "general"],
            default: "general",
        },
        
        journeyStage: {
            type: String,
            enum: ["seed", "growing", "harvest", "compost", "full-cycle"],
        },
        
        likes: [{ type: String }],
        commentCount: { type: Number, default: 0 },
        
        imageUrl: { type: String },
        
        country: { type: String },
        region: { type: String },
        
        isPinned: { type: Boolean, default: false },
        isVerified: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const ForumCommentSchema = new Schema<IForumComment>(
    {
        postId: { type: String, required: true, index: true },
        userId: { type: String, required: true },
        userName: { type: String },
        content: { type: String, required: true, maxlength: 2000 },
        likes: [{ type: String }],
    },
    { timestamps: true }
);

// indexes for efficient querying
ForumPostSchema.index({ category: 1, createdAt: -1 });
ForumPostSchema.index({ isPinned: -1, createdAt: -1 });
ForumPostSchema.index({ journeyStage: 1 });
ForumPostSchema.index({ title: "text", content: "text", userName: "text" }); // text search index

export const ForumPost: Model<IForumPost> =
    mongoose.models.ForumPost || mongoose.model<IForumPost>("ForumPost", ForumPostSchema);

export const ForumComment: Model<IForumComment> =
    mongoose.models.ForumComment || mongoose.model<IForumComment>("ForumComment", ForumCommentSchema);
