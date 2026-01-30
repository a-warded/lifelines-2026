"use client";

import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, CheckCircle2, Pin, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { CATEGORIES, JOURNEY_STAGES } from "../constants";
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
            className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] overflow-hidden hover:border-[var(--color-primary)]/30 transition-colors cursor-pointer flex flex-col"
            onClick={() => onOpenPost(post)}
        >
            <div className="p-4 flex-1 flex flex-col">
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
                    <Badge className="text-xs bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-0">
                        {t(category?.labelKey || "forum.categories.general", post.category)}
                    </Badge>
                    {journeyStage && (
                        <Badge className={`text-xs border-0 ${journeyStage.color}`}>
                            {t(journeyStage.labelKey, String(post.journeyStage))}
                        </Badge>
                    )}
                    
                    {/* Owner actions menu */}
                    {isOwner && (
                        <div className="relative ml-auto flex-shrink-0" ref={menuRef}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setMenuOpen(!menuOpen);
                                }}
                                className="p-1 rounded-md hover:bg-[var(--color-surface)] transition-colors text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                                aria-label={t("forum.actions", "Post actions")}
                            >
                                <MoreVertical className="w-4 h-4" />
                            </button>
                            
                            {menuOpen && (
                                <div className="absolute right-0 top-full mt-1 z-50 min-w-[140px] bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg shadow-lg py-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setMenuOpen(false);
                                            onEdit?.(post);
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] transition-colors"
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
                <h3 className="font-semibold text-[var(--color-text-primary)] text-base mb-2 line-clamp-2">
                    {post.title}
                </h3>

                {/* Content preview - plain text only */}
                <p className="text-sm text-[var(--color-text-secondary)] line-clamp-3 mb-4">
                    {getPlainTextPreview(post.content)}
                </p>

                {/* Author and meta */}
                <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)] mt-auto gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-xs text-white font-medium flex-shrink-0">
                            {(post.userName || "A")[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <span className="text-sm font-medium text-[var(--color-text-primary)] truncate block">
                                {post.userName || t("common.anonymous", "Anonymous")}
                            </span>
                            <span className="text-xs text-[var(--color-text-secondary)]">
                                {timeAgo}
                            </span>
                        </div>
                    </div>

                    {/* Engagement */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onLike(post._id);
                            }}
                            disabled={isLiking}
                            className={`flex items-center gap-1 text-sm transition-colors ${
                                hasLiked 
                                    ? "text-red-500" 
                                    : "text-[var(--color-text-secondary)] hover:text-red-500"
                            }`}
                        >
                            <Heart className={`w-4 h-4 ${hasLiked ? "fill-current" : ""}`} />
                            {post.likes.length}
                        </button>
                        <span className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)]">
                            <MessageCircle className="w-4 h-4" />
                            {post.commentCount}
                        </span>
                    </div>
                </div>
            </div>
        </article>
    );
}

// Helper to strip markdown and get plain text preview
function getPlainTextPreview(markdown: string): string {
    return markdown
        // Remove headers
        .replace(/^#{1,6}\s+/gm, '')
        // Remove bold/italic
        .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1')
        // Remove links
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        // Remove images
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
        // Remove code blocks
        .replace(/```[\s\S]*?```/g, '')
        // Remove inline code
        .replace(/`([^`]+)`/g, '$1')
        // Remove blockquotes
        .replace(/^>\s+/gm, '')
        // Remove horizontal rules
        .replace(/^[-*_]{3,}\s*$/gm, '')
        // Remove list markers
        .replace(/^[-*+]\s+/gm, '')
        .replace(/^\d+\.\s+/gm, '')
        // Collapse whitespace
        .replace(/\s+/g, ' ')
        .trim();
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
