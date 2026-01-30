"use client";

import { useState, useCallback, useMemo, lazy, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Leaf } from "lucide-react";

import {
    PostCard,
    ForumFilters,
    JourneyVisualizer,
} from "./components";

// Lazy load heavy modal components
const CreatePostModal = lazy(() => import("./components/create-post-modal").then(m => ({ default: m.CreatePostModal })));
const PostDetailsModal = lazy(() => import("./components/post-details-modal").then(m => ({ default: m.PostDetailsModal })));
const DeleteConfirmModal = lazy(() => import("./components/delete-confirm-modal").then(m => ({ default: m.DeleteConfirmModal })));

import {
    useForumPosts,
    useCreatePost,
    useLikePost,
    useAddComment,
    useEditPost,
    useDeletePost,
} from "./hooks";

import type { ForumPost, CreatePostForm } from "./types";

// Modal loading fallback
const ModalFallback = () => null;

export default function ForumPage() {
    const { data: session } = useSession();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.dir() === "rtl";

    // Posts data
    const {
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
    } = useForumPosts();

    // Mutations
    const { createPost, isCreating } = useCreatePost();
    const { toggleLike, isLiking } = useLikePost();
    const { addComment, isAdding: isAddingComment } = useAddComment();
    const { editPost, isEditing } = useEditPost();
    const { deletePost, isDeleting } = useDeletePost();

    // UI state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
    const [editingPost, setEditingPost] = useState<ForumPost | null>(null);
    const [deletingPost, setDeletingPost] = useState<ForumPost | null>(null);

    const handleCreatePost = useCallback(async (form: CreatePostForm) => {
        const newPost = await createPost(form);
        if (newPost) {
            setShowCreateModal(false);
            refetch();
        }
    }, [createPost, refetch]);

    const handleEditPost = useCallback(async (form: CreatePostForm) => {
        if (!editingPost) return;
        const updated = await editPost(editingPost._id, form);
        if (updated) {
            setEditingPost(null);
            refetch();
        }
    }, [editPost, editingPost, refetch]);

    const handleDeletePost = useCallback(async () => {
        if (!deletingPost) return;
        const success = await deletePost(deletingPost._id);
        if (success) {
            setDeletingPost(null);
            refetch();
        }
    }, [deletePost, deletingPost, refetch]);

    const handleLike = useCallback(async (postId: string) => {
        const result = await toggleLike(postId);
        if (result) {
            refetch();
        }
    }, [toggleLike, refetch]);

    const handleAddComment = useCallback(async (postId: string, content: string) => {
        return await addComment(postId, content);
    }, [addComment]);

    const handleOpenPost = useCallback((post: ForumPost) => {
        setSelectedPost(post);
    }, []);

    const hasActiveFilters = category !== "all" || journeyStage !== null;

    return (
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 min-h-[calc(100vh-8rem)]">
            {/* Mobile Filter Toggle */}
            <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="lg:hidden flex items-center justify-between w-full px-4 py-3 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]"
            >
                <span className="text-sm font-medium text-[var(--color-text-primary)]">{t("common.filter", "Filters")}</span>
                <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                        <span className="text-xs text-[var(--color-primary)]">{t("exchange.filters.applied", "Active")}</span>
                    )}
                    <svg
                        className={`w-4 h-4 transition-transform ${showMobileFilters ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {/* Filters Sidebar */}
            <div className={`${showMobileFilters ? "block" : "hidden"} lg:block w-full lg:w-72 flex-shrink-0`}>
                <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-5 sticky top-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                                {t("forum.filterPosts", "Filters")}
                            </h2>
                            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                                {t("forum.filters.description", "Refine posts to find what you need")}
                            </p>
                        </div>
                    </div>

                    <ForumFilters
                        category={category}
                        onCategoryChange={setCategory}
                        journeyStage={journeyStage}
                        onJourneyStageChange={setJourneyStage}
                        onClearFilters={() => {
                            setCategory("all");
                            setJourneyStage(null);
                        }}
                        t={t}
                    />

                    {/* Community stats */}
                    <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
                        <h3 className="font-semibold text-sm text-[var(--color-text-primary)] mb-3">
                            {t("forum.community.title", "Community Impact")}
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-[var(--color-text-secondary)]">{t("forum.community.posts", "Stories shared")}</span>
                                <span className="font-medium text-[var(--color-text-primary)]">{pagination.total}</span>
                            </div>
                            <p className="text-xs text-[var(--color-text-secondary)] pt-2 border-t border-[var(--color-border)]">
                                {t("forum.community.motto", "Every tip shared is waste prevented. Keep growing!")}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <Leaf className="w-6 h-6 text-[var(--color-primary)]" />
                            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                                {t("forum.title", "Farmers' Forum")}
                            </h1>
                        </div>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                            {t("forum.subtitle", "Share wisdom, reduce waste. From seed to seed, we grow together.")}
                        </p>
                    </div>
                    <Button onClick={() => setShowCreateModal(true)}>
                        + {t("forum.shareStory", "Share Your Story")}
                    </Button>
                </div>

                {/* Seed to Seed visualizer */}
                <div className="mb-6">
                    <JourneyVisualizer t={t} />
                </div>

                {/* Search Bar */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
                    <input
                        type="text"
                        placeholder={t("forum.searchPlaceholder", "Search for a post...")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                        >
                            ×
                        </button>
                    )}
                </div>

                {/* Posts */}
                {loading ? (
                    <div className="text-center py-12 text-[var(--color-text-secondary)]">
                        {t("common.loading", "Loading...")}
                    </div>
                ) : error ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-[var(--color-text-secondary)]">{error}</p>
                            <Button variant="ghost" onClick={refetch} className="mt-2">
                                {t("common.tryAgain", "Try Again")}
                            </Button>
                        </CardContent>
                    </Card>
                ) : posts.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Leaf className="w-10 h-10 text-[var(--color-primary)] mx-auto mb-3" />
                            <h3 className="font-semibold text-[var(--color-text-primary)]">
                                {searchQuery
                                    ? t("forum.noSearchResults", "No posts match your search")
                                    : t("forum.empty.title", "Be the first to share")}
                            </h3>
                            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                                {searchQuery
                                    ? t("forum.tryDifferentSearch", "Try different keywords or clear the search")
                                    : t("forum.empty.description", "No posts yet in this category. Share your sustainable farming wisdom with the community!")}
                            </p>
                            {!searchQuery && (
                                <Button onClick={() => setShowCreateModal(true)} className="mt-4">
                                    {t("forum.shareStory", "Share Your Story")}
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {posts.map((post) => (
                                <PostCard
                                    key={post._id}
                                    post={post}
                                    userId={session?.user?.id}
                                    onLike={handleLike}
                                    onOpenPost={handleOpenPost}
                                    onEdit={setEditingPost}
                                    onDelete={setDeletingPost}
                                    isLiking={isLiking}
                                    t={t}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-8">
                                <button
                                    onClick={() => setPage(pagination.page - 1)}
                                    disabled={pagination.page <= 1}
                                    className="px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-border)] transition-colors"
                                >
                                    ← {t("common.previous", "Previous")}
                                </button>
                
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                        .filter(page => {
                                            // Show first, last, current, and adjacent pages
                                            if (page === 1 || page === pagination.totalPages) return true;
                                            if (Math.abs(page - pagination.page) <= 1) return true;
                                            return false;
                                        })
                                        .map((page, index, arr) => {
                                            // Add ellipsis if there's a gap
                                            const showEllipsisBefore = index > 0 && page - arr[index - 1] > 1;
                                            return (
                                                <span key={page} className="flex items-center gap-1">
                                                    {showEllipsisBefore && (
                                                        <span className="px-2 text-[var(--color-text-secondary)]">...</span>
                                                    )}
                                                    <button
                                                        onClick={() => setPage(page)}
                                                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                                                            page === pagination.page
                                                                ? "bg-[var(--color-primary)] text-white"
                                                                : "border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-border)]"
                                                        }`}
                                                    >
                                                        {page}
                                                    </button>
                                                </span>
                                            );
                                        })}
                                </div>

                                <button
                                    onClick={() => setPage(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.totalPages}
                                    className="px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-border)] transition-colors"
                                >
                                    {t("common.next", "Next")} →
                                </button>
                            </div>
                        )}

                        {/* Results count */}
                        <p className="text-center text-sm text-[var(--color-text-secondary)] mt-4">
                            {t("forum.showingResults", `Showing ${(pagination.page - 1) * pagination.limit + 1} - ${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total} posts`)}
                        </p>
                    </>
                )}
            </div>

            {/* Modals - lazy loaded */}
            <Suspense fallback={<ModalFallback />}>
                {showCreateModal && (
                    <CreatePostModal
                        isOpen={showCreateModal}
                        onClose={() => setShowCreateModal(false)}
                        onSubmit={handleCreatePost}
                        isCreating={isCreating}
                        t={t}
                    />
                )}

                {editingPost && (
                    <CreatePostModal
                        isOpen={!!editingPost}
                        onClose={() => setEditingPost(null)}
                        onSubmit={handleEditPost}
                        isCreating={isEditing}
                        editingPost={editingPost}
                        t={t}
                    />
                )}

                {deletingPost && (
                    <DeleteConfirmModal
                        post={deletingPost}
                        isOpen={!!deletingPost}
                        onClose={() => setDeletingPost(null)}
                        onConfirm={handleDeletePost}
                        isDeleting={isDeleting}
                        t={t}
                    />
                )}

                {selectedPost && (
                    <PostDetailsModal
                        post={selectedPost}
                        isOpen={!!selectedPost}
                        onClose={() => setSelectedPost(null)}
                        userId={session?.user?.id}
                        onLike={handleLike}
                        onAddComment={handleAddComment}
                        isLiking={isLiking}
                        isAddingComment={isAddingComment}
                        t={t}
                    />
                )}
            </Suspense>
        </div>
    );
}
