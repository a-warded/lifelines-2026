"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import type { ForumPost, TranslateFunction } from "../types";

interface DeleteConfirmModalProps {
    post: ForumPost | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
    t: TranslateFunction;
}

export function DeleteConfirmModal({ 
    post, 
    isOpen, 
    onClose, 
    onConfirm, 
    isDeleting, 
    t 
}: DeleteConfirmModalProps) {
    if (!post) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="" size="sm">
            <div className="text-center py-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-2">
                    {t("forum.delete.title", "Delete Post")}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-6">
                    {t("forum.delete.confirm", "Are you sure you want to delete this post? This action cannot be undone.")}
                </p>
                
                <div className="text-sm text-foreground font-medium bg-muted p-3 rounded-lg mb-6 line-clamp-2">
                    &ldquo;{post.title}&rdquo;
                </div>
                
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="flex-1"
                    >
                        {t("common.cancel", "Cancel")}
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        loading={isDeleting}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                    >
                        {t("forum.delete.button", "Delete")}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
