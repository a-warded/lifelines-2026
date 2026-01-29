"use client";

import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, CheckCircle2, Pin, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { CATEGORIES, JOURNEY_STAGES } from "../constants";
import { MarkdownRenderer } from "./markdown-renderer";
import type { ForumPost, TranslateFunction } from "../types";

interface PostCardProps {
    post: ForumPost;
    userId?: string;
    onLike: (postId: string) => void;
    onOpenPost: (post: ForumPost) => void;
    onEdit?: (post: ForumPost) => void;
    onDelete?: (post: ForumPost) => void;
    isLiking?: boolean;
    t: TranslateFunction;
}

export function PostCard({ post, userId, onLike, onOpenPost, onEdit, onDelete, isLiking, t }: PostCardProps) {
    const category = CATEGORIES.find(c => c.value === post.category);
    const journeyStage = JOURNEY_STAGES.find(s => s.value === post.journeyStage);
    const hasLiked = userId ? post.likes.includes(userId) : false;
    const timeAgo = formatTimeAgo(post.createdAt, t);
    const isOwner = userId && post.userId === userId;
    
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <article 
            className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/30 transition-colors cursor-pointer"
            onClick={() => onOpenPost(post)}
        >
            {/* Image header if present */}
            {post.imageUrl && (
                <div className="relative h-40 bg-gradient-to-br from-green-800 to-green-950 overflow-hidden">
                    <img
                        src={post.imageUrl}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                </div>
            )}

            <div className="p-4">
                {/* Status badges row */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {post.isPinned && (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                            <Pin className="w-3 h-3" />
                            {t("forum.pinned", "Pinned")}
                        </span>
                    )}
                    {post.isVerified && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            {t("forum.verified", "Verified")}
                        </span>
                    )}
                    <Badge className="text-xs bg-muted text-muted-foreground border-0">
                        {t(category?.labelKey || "forum.categories.general", post.category)}
                    </Badge>
                    {journeyStage && (
                        <Badge className={`text-xs border-0 ${journeyStage.color}`}>
                            {t(journeyStage.labelKey, String(post.journeyStage))}
                        </Badge>
                    )}
                    
                    {/* Owner actions menu */}
                    {isOwner && (
                        <div className="relative ml-auto" ref={menuRef}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setMenuOpen(!menuOpen);
                                }}
                                className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                                aria-label={t("forum.actions", "Post actions")}
                            >
                                <MoreVertical className="w-4 h-4" />
                            </button>
                            
                            {menuOpen && (
                                <div className="absolute right-0 top-full mt-1 z-50 min-w-[140px] bg-card border border-border rounded-lg shadow-lg py-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setMenuOpen(false);
                                            onEdit?.(post);
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                                    >
                                        <Pencil className="w-4 h-4" />
                                        {t("forum.edit.button", "Edit")}
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setMenuOpen(false);
                                            onDelete?.(post);
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        {t("forum.delete.button", "Delete")}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Title */}
                <h3 className="font-semibold text-foreground text-base mb-2 line-clamp-2">
                    {post.title}
                </h3>

                {/* Content preview */}
                <div className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    <MarkdownRenderer content={post.content} className="[&_p]:m-0 [&_h1]:text-sm [&_h2]:text-sm [&_h3]:text-sm" />
                </div>

                {/* Author and meta */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs text-primary-foreground font-medium">
                            {(post.userName || "A")[0].toUpperCase()}
                        </div>
                        <div>
                            <span className="text-sm font-medium text-foreground">
                                {post.userName || t("common.anonymous", "Anonymous")}
                            </span>
                            <span className="text-xs text-muted-foreground ml-2">
                                {timeAgo}
                            </span>
                        </div>
                    </div>

                    {/* Engagement */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onLike(post._id);
                            }}
                            disabled={isLiking}
                            className={`flex items-center gap-1 text-sm transition-colors ${
                                hasLiked 
                                    ? "text-red-500" 
                                    : "text-muted-foreground hover:text-red-500"
                            }`}
                        >
                            <Heart className={`w-4 h-4 ${hasLiked ? "fill-current" : ""}`} />
                            {post.likes.length}
                        </button>
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MessageCircle className="w-4 h-4" />
                            {post.commentCount}
                        </span>
                    </div>
                </div>
            </div>
        </article>
    );
}

function formatTimeAgo(dateString: string, t: TranslateFunction): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t("forum.time.justNow", "just now");
    if (diffMins < 60) return t("forum.time.minsAgo", "{{count}}m ago", { count: diffMins });
    if (diffHours < 24) return t("forum.time.hoursAgo", "{{count}}h ago", { count: diffHours });
    if (diffDays < 7) return t("forum.time.daysAgo", "{{count}}d ago", { count: diffDays });
    
    return date.toLocaleDateString();
}
