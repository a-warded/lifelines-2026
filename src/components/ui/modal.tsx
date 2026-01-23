"use client";

import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = "md",
}: ModalProps) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizes = {
        sm: "max-w-md",
        md: "max-w-lg",
        lg: "max-w-2xl",
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={`relative z-10 w-full ${sizes[size]} mx-4 max-h-[90vh] overflow-y-auto rounded-xl bg-card p-6 shadow-xl`}
            >
                {/* Header */}
                {title && (
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
                        <button
                            onClick={onClose}
                            className="rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                )}

                {!title && (
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}

                {/* Content */}
                {children}
            </div>
        </div>
    );
}
