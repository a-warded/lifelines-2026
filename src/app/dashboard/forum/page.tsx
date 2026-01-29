"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Plus, Filter, X, Leaf } from "lucide-react";

import {
    PostCard,
    ForumFilters,
    CreatePostModal,
    PostDetailsModal,
    JourneyVisualizer,
    DeleteConfirmModal,
} from "./components";

import {
    useForumPosts,
    useCreatePost,
    useLikePost,
    useAddComment,
    useEditPost,
    useDeletePost,
} from "./hooks";

import type { ForumPost, CreatePostForm } from "./types";

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
    const [showFilters, setShowFilters] = useState(false);
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

    return (
        <div className="container mx-auto max-w-6xl space-y-6 p-4 md:p-6">
            {/* Header */}
            <header className="space-y-1">
                <div className="flex items-center gap-2">
                    <Leaf className="w-6 h-6 text-primary" />
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        {t("forum.title", "Farmers' Forum")}
                    </h1>
                </div>
                <p className="text-sm text-muted-foreground">
                    {t("forum.subtitle", "Share wisdom, reduce waste. From seed to seed, we grow together.")}
                </p>
            </header>

            <div className="grid gap-6 lg:grid-cols-[1fr,300px]">
                {/* Main Content */}
                <main className="space-y-5">
                    {/* Action bar */}
                    <div className="flex items-center justify-between gap-3">
                        <Button
                            onClick={() => setShowCreateModal(true)}
                            className="gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            {t("forum.shareStory", "Share Your Story")}
                        </Button>

                        {/* Mobile filter toggle */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className="lg:hidden gap-2"
                        >
                            {showFilters ? <X className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
                            {t("common.filter", "Filter")}
                        </Button>
                    </div>

                    {/* Mobile filters */}
                    {showFilters && (
                        <div className="lg:hidden p-4 rounded-lg border border-border bg-card">
                            <ForumFilters
                                category={category}
                                onCategoryChange={setCategory}
                                journeyStage={journeyStage}
                                onJourneyStageChange={setJourneyStage}
                                t={t}
                            />
                        </div>
                    )}

                    {/* Posts list */}
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">{error}</p>
                            <Button variant="ghost" onClick={refetch} className="mt-2">
                                {t("common.tryAgain", "Try Again")}
                            </Button>
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="text-center py-12 space-y-3">
                            <Leaf className="w-10 h-10 text-primary mx-auto" />
                            <h3 className="font-semibold text-foreground">
                                {t("forum.empty.title", "Be the first to share")}
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                {t("forum.empty.description", "No posts yet in this category. Share your sustainable farming wisdom with the community!")}
                            </p>
                            <Button onClick={() => setShowCreateModal(true)} className="mt-2">
                                {t("forum.shareStory", "Share Your Story")}
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
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
                    )}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex justify-center gap-2 pt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(pagination.page - 1)}
                                disabled={pagination.page <= 1}
                            >
                                {t("common.previous", "Previous")}
                            </Button>
                            <span className="flex items-center text-sm text-muted-foreground px-3">
                                {pagination.page} / {pagination.totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(pagination.page + 1)}
                                disabled={pagination.page >= pagination.totalPages}
                            >
                                {t("common.next", "Next")}
                            </Button>
                        </div>
                    )}
                </main>

                {/* Sidebar */}
                <aside className={`hidden lg:block space-y-4 ${isRTL ? "order-first" : ""}`}>
                    {/* Seed to Seed visualizer */}
                    <JourneyVisualizer t={t} />

                    {/* Desktop filters */}
                    <div className="rounded-lg border border-border/50 p-4 space-y-4">
                        <h3 className="font-semibold text-sm text-foreground">
                            {t("forum.filterPosts", "Filter Posts")}
                        </h3>
                        <ForumFilters
                            category={category}
                            onCategoryChange={setCategory}
                            journeyStage={journeyStage}
                            onJourneyStageChange={setJourneyStage}
                            t={t}
                        />
                    </div>

                    {/* Community stats */}
                    <div className="rounded-lg border border-border/50 p-4">
                        <h3 className="font-semibold text-sm text-foreground mb-3">
                            {t("forum.community.title", "Community Impact")}
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t("forum.community.posts", "Stories shared")}</span>
                                <span className="font-medium text-foreground">{pagination.total}</span>
                            </div>
                            <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                                {t("forum.community.motto", "Every tip shared is waste prevented. Keep growing!")}
                            </p>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Modals */}
            <CreatePostModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreatePost}
                isCreating={isCreating}
                t={t}
            />

            <CreatePostModal
                isOpen={!!editingPost}
                onClose={() => setEditingPost(null)}
                onSubmit={handleEditPost}
                isCreating={isEditing}
                editingPost={editingPost}
                t={t}
            />

            <DeleteConfirmModal
                post={deletingPost}
                isOpen={!!deletingPost}
                onClose={() => setDeletingPost(null)}
                onConfirm={handleDeletePost}
                isDeleting={isDeleting}
                t={t}
            />

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
        </div>
    );
}
