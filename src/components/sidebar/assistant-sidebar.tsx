"use client";

import { Bot, X } from "lucide-react";
import { useState } from "react";

interface AssistantSidebarProps {
    children: React.ReactNode;
}

export function AssistantSidebar({ children }: AssistantSidebarProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile toggle button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed right-4 top-4 z-50 rounded-lg bg-primary p-2 text-primary-foreground lg:hidden"
                aria-label={isOpen ? "Close assistant" : "Open assistant"}
            >
                {isOpen ? <X size={24} /> : <Bot size={24} />}
            </button>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Assistant sidebar panel */}
            <aside
                className={`fixed right-0 top-0 z-40 h-screen w-full max-w-md transform bg-sidebar transition-transform duration-300 ease-in-out ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                } lg:translate-x-0 lg:w-96 xl:w-[28rem]`}
            >
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
                        <div className="flex items-center gap-2">
                            <Bot className="h-6 w-6 text-primary" />
                            <span className="text-lg font-semibold text-sidebar-foreground">
                                Aila Assistant
                            </span>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="rounded-lg p-1.5 text-sidebar-foreground hover:bg-sidebar-accent lg:hidden"
                            aria-label="Close assistant"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content area - renders the assistant */}
                    <div className="flex-1 overflow-hidden">
                        {children}
                    </div>
                </div>
            </aside>
        </>
    );
}
