"use client";

import { addToOfflineQueue, getFromCache, setToCache } from "@/lib/offline-storage";
import { useState, useCallback, useEffect, useRef } from "react";
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

// Cache key generator for forum posts
const getForumCacheKey = (category: string, journeyStage: string | null, searchQuery: string, page: number) =>
    `forum_posts_${category}_${journeyStage || "all"}_${searchQuery || ""}_${page}`;

// Helper to get initial cached forum data
const getInitialForumCache = (category: PostCategory | "all") => {
    if (typeof window === 'undefined') return null;
    const cacheKey = getForumCacheKey(category, null, "", 1);
    return getFromCache<{ posts: ForumPost[]; pagination: Pagination }>(cacheKey);
};

export function useForumPosts(options: UseForumPostsOptions = {}) {
    const initialCategory = options.initialCategory || "all";
    
    // Initialize empty, will load from cache in useEffect
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [category, setCategory] = useState<PostCategory | "all">(initialCategory);
    const [journeyStage, setJourneyStage] = useState<JourneyStage | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 21,
        total: 0,
        totalPages: 0,
    });
    const [isOffline, setIsOffline] = useState(false);
    const [isCached, setIsCached] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    
    // Debounce search query - wait 300ms after user stops typing
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);
    
    // Load from cache on client mount - show cached data immediately
    useEffect(() => {
        const cached = getInitialForumCache(initialCategory);
        if (cached) {
            setPosts(cached.posts || []);
            setPagination(cached.pagination);
            setIsCached(true);
            setLoading(false); // Don't show loading if we have cached data
        }
        setIsOffline(typeof navigator !== 'undefined' ? !navigator.onLine : false);
    }, [initialCategory]);

    const fetchPosts = useCallback(async (page = 1, showLoading = true) => {
        // Cancel any in-flight request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        
        // Only show loading spinner if we don't have cached data
        if (showLoading && posts.length === 0) {
            setLoading(true);
        }
        setError(null);
        
        const cacheKey = getForumCacheKey(category, journeyStage, debouncedSearchQuery, page);
        
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
            if (debouncedSearchQuery.trim()) {
                params.set("search", debouncedSearchQuery.trim());
            }
            
            const response = await fetch(`/api/forum?${params}`, {
                signal: abortControllerRef.current.signal,
            });
            if (!response.ok) throw new Error("Failed to fetch posts");
            
            const data = await response.json();
            setPosts(data.posts);
            setPagination(data.pagination);
            setIsCached(false);
            setIsOffline(false);
            
            // Cache the response
            setToCache(cacheKey, { posts: data.posts, pagination: data.pagination });
        } catch (err) {
            // Ignore abort errors
            if (err instanceof Error && err.name === 'AbortError') return;
            
            // Try to load from cache
            const cached = getFromCache<{ posts: ForumPost[]; pagination: Pagination }>(cacheKey);
            if (cached) {
                setPosts(cached.posts);
                setPagination(cached.pagination);
                setIsCached(true);
                setError(null);
            } else {
                setError(err instanceof Error ? err.message : "Something went wrong");
            }
            setIsOffline(!navigator.onLine);
        } finally {
            setLoading(false);
        }
    }, [category, journeyStage, debouncedSearchQuery, pagination.limit, posts.length]);

    const refetch = useCallback(() => {
        fetchPosts(pagination.page, false);
    }, [fetchPosts, pagination.page]);

    const setPage = useCallback((page: number) => {
        fetchPosts(page);
    }, [fetchPosts]);

    // Fetch when filters change (using debounced search)
    useEffect(() => {
        fetchPosts(1);
    }, [category, journeyStage, debouncedSearchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

    // Refetch when coming back online
    useEffect(() => {
        const handleOnline = () => {
            setIsOffline(false);
            if (isCached) {
                fetchPosts(pagination.page);
            }
        };
        const handleOffline = () => setIsOffline(true);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, [fetchPosts, pagination.page, isCached]);

    return {
        posts,
        loading,
        error,
        category,
        setCategory,
        journeyStage,
        setJourneyStage,
        searchQuery,
        setSearchQuery,
        pagination,
        setPage,
        refetch,
        isOffline,
        isCached,
    };
}

export function useCreatePost() {
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isQueued, setIsQueued] = useState(false);

    const createPost = useCallback(async (postData: {
        title: string;
        content: string;
        category: PostCategory;
        journeyStage?: JourneyStage;
        imageUrl?: string;
    }) => {
        setIsCreating(true);
        setError(null);
        setIsQueued(false);
        
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
            // If offline, queue the post for later
            if (!navigator.onLine) {
                addToOfflineQueue({
                    endpoint: "/api/forum",
                    method: "POST",
                    body: postData,
                });
                setIsQueued(true);
                setError(null);
                return null;
            }
            setError(err instanceof Error ? err.message : "Something went wrong");
            return null;
        } finally {
            setIsCreating(false);
        }
    }, []);

    return { createPost, isCreating, error, isQueued };
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
