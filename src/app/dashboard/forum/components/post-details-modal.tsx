"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, CheckCircle2, Pin, ArrowLeft, Send } from "lucide-react";
import { CATEGORIES, JOURNEY_STAGES } from "../constants";
import { MarkdownRenderer } from "./markdown-renderer";
import type { ForumPost, ForumComment, TranslateFunction } from "../types";

interface PostDetailsModalProps {
    post: ForumPost | null;
    isOpen: boolean;
    onClose: () => void;
    userId?: string;
    onLike: (postId: string) => void;
    onAddComment: (postId: string, content: string) => Promise<unknown>;
    isLiking?: boolean;
    isAddingComment?: boolean;
    t: TranslateFunction;
}

export function PostDetailsModal({
    post,
    isOpen,
    onClose,
    userId,
    onLike,
    onAddComment,
    isLiking,
    isAddingComment,
    t,
}: PostDetailsModalProps) {
    const [comments, setComments] = useState<ForumComment[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [localLikes, setLocalLikes] = useState(post?.likes || []);

    useEffect(() => {
        if (post) {
            setLocalLikes(post.likes);
        }
    }, [post]);

    const fetchComments = useCallback(async () => {
        if (!post) return;
        
        setLoadingComments(true);
        try {
            const response = await fetch(`/api/forum?postId=${post._id}`);
            if (response.ok) {
                const data = await response.json();
                setComments(data.comments || []);
            }
        } catch (err) {
            console.error("Failed to fetch comments:", err);
        } finally {
            setLoadingComments(false);
        }
    }, [post]);

    useEffect(() => {
        if (isOpen && post) {
            fetchComments();
        }
    }, [isOpen, post, fetchComments]);

    const handleSubmitComment = async () => {
        if (!post || !newComment.trim()) return;
        
        const result = await onAddComment(post._id, newComment.trim());
        if (result) {
            setNewComment("");
            fetchComments();
        }
    };

    const handleLike = () => {
        if (!post || !userId) return;
        
        // optimistic update
        const hasLiked = localLikes.includes(userId);
        if (hasLiked) {
            setLocalLikes(prev => prev.filter(id => id !== userId));
        } else {
            setLocalLikes(prev => [...prev, userId]);
        }
        
        onLike(post._id);
    };

    if (!post) return null;

    const category = CATEGORIES.find(c => c.value === post.category);
    const journeyStage = JOURNEY_STAGES.find(s => s.value === post.journeyStage);
    const hasLiked = userId ? localLikes.includes(userId) : false;

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose}
            title=""
            size="lg"
        >
            <div className="space-y-4">
                {/* Back button */}
                <button 
                    onClick={onClose}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t("common.back", "Back")}
                </button>

                {/* Image */}
                {post.imageUrl && (
                    <div className="relative h-48 rounded-lg bg-gradient-to-br from-green-800 to-green-950 overflow-hidden">
                        <img
                            src={post.imageUrl}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    </div>
                )}

                {/* Status badges */}
                <div className="flex items-center gap-2 flex-wrap">
                    {post.isPinned && (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                            <Pin className="w-3 h-3" />
                            {t("forum.pinned", "Pinned")}
                        </span>
                    )}
                    {post.isVerified && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            {t("forum.verified", "Verified Practice")}
                        </span>
                    )}
                    <Badge className="text-xs bg-muted text-muted-foreground border-0">
                        {t(category?.labelKey || "", post.category)}
                    </Badge>
                    {journeyStage && (
                        <Badge className={`text-xs border-0 ${journeyStage.color}`}>
                            {t(journeyStage.labelKey, String(post.journeyStage))}
                        </Badge>
                    )}
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-foreground">
                    {post.title}
                </h2>

                {/* Author */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm text-primary-foreground font-medium">
                        {(post.userName || "A")[0].toUpperCase()}
                    </div>
                    <div>
                        <span className="text-sm font-medium text-foreground">
                            {post.userName || t("common.anonymous", "Anonymous")}
                        </span>
                        <span className="text-xs text-muted-foreground block">
                            {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="prose prose-sm dark:prose-invert max-w-none">
                    <MarkdownRenderer content={post.content} />
                </div>

                {/* Engagement bar */}
                <div className="flex items-center gap-4 pt-3 border-t border-border">
                    <button
                        onClick={handleLike}
                        disabled={isLiking || !userId}
                        className={`flex items-center gap-1.5 text-sm transition-colors ${
                            hasLiked 
                                ? "text-red-500" 
                                : "text-muted-foreground hover:text-red-500"
                        }`}
                    >
                        <Heart className={`w-5 h-5 ${hasLiked ? "fill-current" : ""}`} />
                        {localLikes.length} {t("forum.likes", "likes")}
                    </button>
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MessageCircle className="w-5 h-5" />
                        {comments.length} {t("forum.comments", "comments")}
                    </span>
                </div>

                {/* Comments section */}
                <div className="space-y-4 pt-4 border-t border-border">
                    <h4 className="font-semibold text-foreground">
                        {t("forum.commentsSection", "Discussion")}
                    </h4>

                    {/* Comment input */}
                    {userId ? (
                        <div className="flex gap-2">
                            <Textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder={t("forum.commentPlaceholder", "Share your thoughts...")}
                                rows={2}
                                className="flex-1"
                            />
                            <Button
                                onClick={handleSubmitComment}
                                disabled={!newComment.trim() || isAddingComment}
                                loading={isAddingComment}
                                size="sm"
                                className="self-end"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground italic">
                            {t("forum.signInToComment", "Sign in to join the discussion")}
                        </p>
                    )}

                    {/* Comments list */}
                    {loadingComments ? (
                        <div className="flex justify-center py-4">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        </div>
                    ) : comments.length > 0 ? (
                        <div className="space-y-3">
                            {comments.map((comment) => (
                                <div key={comment._id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary font-medium shrink-0">
                                        {(comment.userName || "A")[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-medium text-foreground">
                                                {comment.userName || t("common.anonymous", "Anonymous")}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(comment.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-foreground">{comment.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            {t("forum.noComments", "No comments yet. Start the discussion!")}
                        </p>
                    )}
                </div>
            </div>
        </Modal>
    );
}
