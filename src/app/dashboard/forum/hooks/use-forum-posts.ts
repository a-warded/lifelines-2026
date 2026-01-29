"use client";

import { useState, useCallback, useEffect } from "react";
import type { ForumPost, PostCategory, JourneyStage } from "../types";

interface UseForumPostsOptions {
    initialCategory?: PostCategory | "all";
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export function useForumPosts(options: UseForumPostsOptions = {}) {
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [category, setCategory] = useState<PostCategory | "all">(options.initialCategory || "all");
    const [journeyStage, setJourneyStage] = useState<JourneyStage | null>(null);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    });

    const fetchPosts = useCallback(async (page = 1) => {
        setLoading(true);
        setError(null);
        
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: pagination.limit.toString(),
            });
            
            if (category !== "all") {
                params.set("category", category);
            }
            if (journeyStage) {
                params.set("journeyStage", journeyStage);
            }
            
            const response = await fetch(`/api/forum?${params}`);
            if (!response.ok) throw new Error("Failed to fetch posts");
            
            const data = await response.json();
            setPosts(data.posts);
            setPagination(data.pagination);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    }, [category, journeyStage, pagination.limit]);

    const refetch = useCallback(() => {
        fetchPosts(pagination.page);
    }, [fetchPosts, pagination.page]);

    const setPage = useCallback((page: number) => {
        fetchPosts(page);
    }, [fetchPosts]);

    useEffect(() => {
        fetchPosts(1);
    }, [category, journeyStage]); // eslint-disable-line react-hooks/exhaustive-deps

    return {
        posts,
        loading,
        error,
        category,
        setCategory,
        journeyStage,
        setJourneyStage,
        pagination,
        setPage,
        refetch,
    };
}

export function useCreatePost() {
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createPost = useCallback(async (postData: {
        title: string;
        content: string;
        category: PostCategory;
        journeyStage?: JourneyStage;
        imageUrl?: string;
    }) => {
        setIsCreating(true);
        setError(null);
        
        try {
            const response = await fetch("/api/forum", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(postData),
            });
            
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to create post");
            }
            
            const data = await response.json();
            return data.post as ForumPost;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
            return null;
        } finally {
            setIsCreating(false);
        }
    }, []);

    return { createPost, isCreating, error };
}

export function useLikePost() {
    const [isLiking, setIsLiking] = useState(false);

    const toggleLike = useCallback(async (postId: string) => {
        setIsLiking(true);
        
        try {
            const response = await fetch("/api/forum", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "like", postId }),
            });
            
            if (!response.ok) throw new Error("Failed to like post");
            
            const data = await response.json();
            return data as { likes: number; hasLiked: boolean };
        } catch (err) {
            console.error("Like error:", err);
            return null;
        } finally {
            setIsLiking(false);
        }
    }, []);

    return { toggleLike, isLiking };
}

export function useAddComment() {
    const [isAdding, setIsAdding] = useState(false);

    const addComment = useCallback(async (postId: string, content: string) => {
        setIsAdding(true);
        
        try {
            const response = await fetch("/api/forum", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "comment", postId, commentContent: content }),
            });
            
            if (!response.ok) throw new Error("Failed to add comment");
            
            const data = await response.json();
            return data.comment;
        } catch (err) {
            console.error("Comment error:", err);
            return null;
        } finally {
            setIsAdding(false);
        }
    }, []);

    return { addComment, isAdding };
}

export function useEditPost() {
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const editPost = useCallback(async (postId: string, postData: {
        title: string;
        content: string;
        category: PostCategory;
        journeyStage?: JourneyStage;
        imageUrl?: string;
    }) => {
        setIsEditing(true);
        setError(null);
        
        try {
            const response = await fetch("/api/forum", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    action: "edit", 
                    postId,
                    ...postData 
                }),
            });
            
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to update post");
            }
            
            const data = await response.json();
            return data.post as ForumPost;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
            return null;
        } finally {
            setIsEditing(false);
        }
    }, []);

    return { editPost, isEditing, error };
}

export function useDeletePost() {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deletePost = useCallback(async (postId: string) => {
        setIsDeleting(true);
        setError(null);
        
        try {
            const response = await fetch(`/api/forum?postId=${postId}`, {
                method: "DELETE",
            });
            
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to delete post");
            }
            
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
            return false;
        } finally {
            setIsDeleting(false);
        }
    }, []);

    return { deletePost, isDeleting, error };
}
