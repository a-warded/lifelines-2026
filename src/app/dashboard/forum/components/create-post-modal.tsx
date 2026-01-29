"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { CATEGORIES, JOURNEY_STAGES, DEFAULT_CREATE_FORM } from "../constants";
import type { CreatePostForm, ForumPost, PostCategory, JourneyStage, TranslateFunction } from "../types";
import { RichTextEditor } from "./rich-text-editor";

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (form: CreatePostForm) => Promise<void>;
    isCreating: boolean;
    t: TranslateFunction;
    editingPost?: ForumPost | null;
}

export function CreatePostModal({
    isOpen,
    onClose,
    onSubmit,
    isCreating,
    t,
    editingPost,
}: CreatePostModalProps) {
    const [form, setForm] = useState<CreatePostForm>(DEFAULT_CREATE_FORM);

    // Populate form when editing
    useEffect(() => {
        if (editingPost) {
            setForm({
                title: editingPost.title,
                content: editingPost.content,
                category: editingPost.category,
                journeyStage: editingPost.journeyStage,
                imageUrl: editingPost.imageUrl || "",
            });
        } else {
            setForm(DEFAULT_CREATE_FORM);
        }
    }, [editingPost, isOpen]);

    const handleSubmit = async () => {
        if (!form.title.trim() || !form.content.trim()) return;
        await onSubmit(form);
        setForm(DEFAULT_CREATE_FORM);
    };

    const handleClose = () => {
        setForm(DEFAULT_CREATE_FORM);
        onClose();
    };

    const availableCategories = CATEGORIES.filter(c => c.value !== "all");
    const isEditing = !!editingPost;

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={handleClose}
            title={isEditing ? t("forum.edit.title", "Edit Your Post") : t("forum.create.title", "Share Your Wisdom")}
            size="lg"
        >
            <div className="space-y-5">
                {/* Intro text */}
                <p className="text-sm text-muted-foreground">
                    {isEditing 
                        ? t("forum.edit.intro", "Update your story or fix any details you'd like to change.")
                        : t("forum.create.intro", "Help fellow farmers reduce waste and grow sustainably. What have you learned on your journey from seed back to seed?")}
                </p>

                {/* Title */}
                <div>
                    <label className="block text-sm font-medium mb-1.5">
                        {t("forum.create.titleLabel", "Title")} *
                    </label>
                    <Input
                        value={form.title}
                        onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder={t("forum.create.titlePlaceholder", "e.g., How I cut water usage by 40% with mulching")}
                        maxLength={200}
                    />
                </div>

                {/* Content */}
                <div>
                    <label className="block text-sm font-medium mb-1.5">
                        {t("forum.create.contentLabel", "Your Story")} *
                    </label>
                    <RichTextEditor
                        value={form.content}
                        onChange={(content) => setForm(prev => ({ ...prev, content }))}
                        placeholder={t("forum.create.contentPlaceholder", "Share your experience, tips, and what worked for your farm...")}
                        maxLength={5000}
                        rows={8}
                    />
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium mb-1.5">
                        {t("forum.create.categoryLabel", "Topic")}
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {availableCategories.map((cat) => (
                            <Button
                                key={cat.value}
                                type="button"
                                variant={form.category === cat.value ? "primary" : "outline"}
                                size="sm"
                                onClick={() => setForm(prev => ({ ...prev, category: cat.value as PostCategory }))}
                                className="text-xs"
                            >
                                {t(cat.labelKey, cat.value)}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Journey Stage */}
                <div>
                    <label className="block text-sm font-medium mb-1.5">
                        {t("forum.create.journeyLabel", "Part of the Cycle")}
                        <span className="text-muted-foreground font-normal ml-1">
                            ({t("common.optional", "optional")})
                        </span>
                    </label>
                    <p className="text-xs text-muted-foreground mb-2">
                        {t("forum.create.journeyHint", "Where in the seed-to-seed journey does this tip apply?")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {JOURNEY_STAGES.map((stage) => (
                            <Button
                                key={stage.value}
                                type="button"
                                variant={form.journeyStage === stage.value ? "primary" : "outline"}
                                size="sm"
                                onClick={() => setForm(prev => ({ 
                                    ...prev, 
                                    journeyStage: prev.journeyStage === stage.value ? undefined : stage.value 
                                }))}
                                className="text-xs"
                            >
                                {t(stage.labelKey, stage.value)}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Image URL (optional) */}
                <div>
                    <label className="block text-sm font-medium mb-1.5">
                        {t("forum.create.imageLabel", "Image URL")}
                        <span className="text-muted-foreground font-normal ml-1">
                            ({t("common.optional", "optional")})
                        </span>
                    </label>
                    <Input
                        value={form.imageUrl || ""}
                        onChange={(e) => setForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                        placeholder="https://..."
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isCreating}
                        className="flex-1"
                    >
                        {t("common.cancel", "Cancel")}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!form.title.trim() || !form.content.trim() || isCreating}
                        loading={isCreating}
                        className="flex-1"
                    >
                        {isEditing 
                            ? t("forum.edit.submit", "Save Changes") 
                            : t("forum.create.submit", "Share with Community")}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
