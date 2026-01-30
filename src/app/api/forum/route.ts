import { auth } from "@/lib/auth";
import { connectMongo } from "@/lib/mongo";
import { ForumPost, ForumComment, type PostCategory } from "@/lib/models/forum-post";
import { NextRequest, NextResponse } from "next/server";

// GET - fetch forum posts with optional filtering
export async function GET(request: NextRequest) {
    try {
        await connectMongo();
        const { searchParams } = new URL(request.url);
        
        const category = searchParams.get("category");
        const journeyStage = searchParams.get("journeyStage");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "21");
        const postId = searchParams.get("postId"); // for fetching single post
        
        // fetch single post with comments
        if (postId) {
            const post = await ForumPost.findById(postId).lean();
            if (!post) {
                return NextResponse.json({ error: "Post not found" }, { status: 404 });
            }
            
            const comments = await ForumComment.find({ postId })
                .sort({ createdAt: -1 })
                .limit(50)
                .lean();
            
            return NextResponse.json({ post, comments });
        }
        
        // build query
        const query: Record<string, unknown> = {};
        if (category && category !== "all") {
            query.category = category;
        }
        if (journeyStage) {
            query.journeyStage = journeyStage;
        }
        
        // fetch posts with pagination
        const skip = (page - 1) * limit;
        
        const [posts, total] = await Promise.all([
            ForumPost.find(query)
                .sort({ isPinned: -1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            ForumPost.countDocuments(query),
        ]);
        
        return NextResponse.json({
            posts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Forum GET error:", error);
        return NextResponse.json(
            { error: "Failed to fetch posts" },
            { status: 500 }
        );
    }
}

// POST - create a new forum post
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        await connectMongo();
        const body = await request.json();
        
        const { title, content, category, journeyStage, imageUrl, country, region } = body;
        
        if (!title?.trim() || !content?.trim()) {
            return NextResponse.json(
                { error: "Title and content are required" },
                { status: 400 }
            );
        }
        
        const post = await ForumPost.create({
            userId: session.user.id,
            userName: session.user.name || "Anonymous Farmer",
            title: title.trim(),
            content: content.trim(),
            category: category || "general",
            journeyStage,
            imageUrl,
            country,
            region,
            likes: [],
            commentCount: 0,
            isPinned: false,
            isVerified: false,
        });
        
        return NextResponse.json({ post }, { status: 201 });
    } catch (error) {
        console.error("Forum POST error:", error);
        return NextResponse.json(
            { error: "Failed to create post" },
            { status: 500 }
        );
    }
}

// PATCH - like/unlike a post or add comment
export async function PATCH(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        await connectMongo();
        const body = await request.json();
        const { action, postId, commentContent } = body;
        
        if (!postId) {
            return NextResponse.json({ error: "Post ID required" }, { status: 400 });
        }
        
        if (action === "like") {
            const post = await ForumPost.findById(postId);
            if (!post) {
                return NextResponse.json({ error: "Post not found" }, { status: 404 });
            }
            
            const userId = session.user.id;
            const hasLiked = post.likes.includes(userId);
            
            if (hasLiked) {
                post.likes = post.likes.filter((id: string) => id !== userId);
            } else {
                post.likes.push(userId);
            }
            
            await post.save();
            return NextResponse.json({ 
                likes: post.likes.length, 
                hasLiked: !hasLiked 
            });
        }
        
        if (action === "comment") {
            if (!commentContent?.trim()) {
                return NextResponse.json(
                    { error: "Comment content required" },
                    { status: 400 }
                );
            }
            
            const comment = await ForumComment.create({
                postId,
                userId: session.user.id,
                userName: session.user.name || "Anonymous Farmer",
                content: commentContent.trim(),
                likes: [],
            });
            
            await ForumPost.findByIdAndUpdate(postId, {
                $inc: { commentCount: 1 },
            });
            
            return NextResponse.json({ comment }, { status: 201 });
        }
        
        if (action === "edit") {
            const { title, content, category, journeyStage, imageUrl } = body;
            
            const post = await ForumPost.findById(postId);
            if (!post) {
                return NextResponse.json({ error: "Post not found" }, { status: 404 });
            }
            
            if (post.userId !== session.user.id) {
                return NextResponse.json({ error: "Not authorized to edit this post" }, { status: 403 });
            }
            
            if (!title?.trim() || !content?.trim()) {
                return NextResponse.json(
                    { error: "Title and content are required" },
                    { status: 400 }
                );
            }
            
            post.title = title.trim();
            post.content = content.trim();
            post.category = category || post.category;
            post.journeyStage = journeyStage || post.journeyStage;
            if (imageUrl !== undefined) post.imageUrl = imageUrl;
            post.updatedAt = new Date();
            
            await post.save();
            return NextResponse.json({ post });
        }
        
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("Forum PATCH error:", error);
        return NextResponse.json(
            { error: "Failed to update" },
            { status: 500 }
        );
    }
}

// DELETE - delete own post
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        await connectMongo();
        const { searchParams } = new URL(request.url);
        const postId = searchParams.get("postId");
        
        if (!postId) {
            return NextResponse.json({ error: "Post ID required" }, { status: 400 });
        }
        
        const post = await ForumPost.findById(postId);
        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }
        
        if (post.userId !== session.user.id) {
            return NextResponse.json({ error: "Not authorized" }, { status: 403 });
        }
        
        await Promise.all([
            ForumPost.findByIdAndDelete(postId),
            ForumComment.deleteMany({ postId }),
        ]);
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Forum DELETE error:", error);
        return NextResponse.json(
            { error: "Failed to delete post" },
            { status: 500 }
        );
    }
}
