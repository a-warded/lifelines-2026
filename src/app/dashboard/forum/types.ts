import { TFunction } from "i18next";

export type PostCategory = "composting" | "water-saving" | "seed-saving" | "crop-rotation" | "organic" | "zero-waste" | "general";
export type JourneyStage = "seed" | "growing" | "harvest" | "compost" | "full-cycle";

export interface ForumPost {
    _id: string;
    userId: string;
    userName?: string;
    title: string;
    content: string;
    category: PostCategory;
    journeyStage?: JourneyStage;
    likes: string[];
    commentCount: number;
    imageUrl?: string;
    country?: string;
    region?: string;
    isPinned: boolean;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ForumComment {
    _id: string;
    postId: string;
    userId: string;
    userName?: string;
    content: string;
    likes: string[];
    createdAt: string;
    updatedAt: string;
}

export interface CreatePostForm {
    title: string;
    content: string;
    category: PostCategory;
    journeyStage?: JourneyStage;
    imageUrl?: string;
}

export type TranslateFunction = TFunction<"translation", undefined>;
