"use client";

import { Bot, ChevronLeft, ChevronRight, X } from "lucide-react";
import { createContext, useContext, useState, ReactNode } from "react";
import { useTranslation } from "react-i18next";

// Context to share sidebar state with layout
interface AssistantSidebarContextType {
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
}

const AssistantSidebarContext = createContext<AssistantSidebarContextType>({
    isCollapsed: false,
    setIsCollapsed: () => {},
});

export const useAssistantSidebar = () => useContext(AssistantSidebarContext);

// Provider component that wraps both sidebar and dashboard content
interface AssistantSidebarProviderProps {
    children: ReactNode;
}

export function AssistantSidebarProvider({ children }: AssistantSidebarProviderProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <AssistantSidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
            {children}
        </AssistantSidebarContext.Provider>
    );
}

interface AssistantSidebarProps {
    children: React.ReactNode;
}

export function AssistantSidebar({ children }: AssistantSidebarProps) {
    const [isOpen, setIsOpen] = useState(false); // Mobile state
    const { isCollapsed, setIsCollapsed } = useAssistantSidebar(); // Get from context
    const { i18n, t } = useTranslation();
    const isRTL = i18n.dir() === "rtl";

    const toggleCollapse = () => setIsCollapsed(!isCollapsed);

    return (
        <>
            {/* Mobile toggle button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed top-4 z-50 rounded-lg bg-primary p-2 text-primary-foreground lg:hidden ${
                    isRTL ? "left-4" : "right-4"
                }`}
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

            {/* Desktop reopen button - shows when collapsed */}
            <button
                onClick={toggleCollapse}
                className={`fixed top-1/2 z-50 hidden -translate-y-1/2 lg:flex items-center justify-center
                    w-10 h-20 rounded-l-xl bg-primary text-primary-foreground shadow-lg
                    transition-all duration-500 ease-in-out hover:scale-105
                    ${isCollapsed ? "opacity-100" : "opacity-0 pointer-events-none"}
                    ${isRTL ? "left-0 rounded-l-none rounded-r-xl" : "right-0"}`}
                aria-label="Open assistant"
            >
                <div className="flex flex-col items-center gap-1">
                    {isRTL ? (
                        <ChevronRight size={20} className="animate-pulse" />
                    ) : (
                        <ChevronLeft size={20} className="animate-pulse" />
                    )}
                    <Bot size={18} />
                </div>
            </button>

            {/* Assistant sidebar panel */}
            <aside
                className={`fixed top-0 z-40 h-screen w-full max-w-md transform bg-sidebar transition-all duration-500 ease-in-out lg:w-96 xl:w-[28rem] ${
                    isRTL
                        ? `left-0 ${isOpen ? "translate-x-0" : "-translate-x-full"} ${isCollapsed ? "lg:-translate-x-full" : "lg:translate-x-0"}`
                        : `right-0 ${isOpen ? "translate-x-0" : "translate-x-full"} ${isCollapsed ? "lg:translate-x-full" : "lg:translate-x-0"}`
                }`}
            >
                {/* Desktop collapse toggle arrow - top left corner */}
                <button
                    onClick={toggleCollapse}
                    className={`absolute top-4 z-50 hidden lg:flex items-center justify-center
                        w-8 h-8 rounded-full bg-sidebar-accent text-sidebar-foreground
                        shadow-md border border-sidebar-border
                        transition-all duration-300 ease-in-out
                        hover:bg-primary hover:text-primary-foreground hover:scale-110
                        ${isRTL ? "right-4" : "left-4"}`}
                    aria-label={isCollapsed ? "Open assistant" : "Close assistant"}
                >
                    {isRTL ? (
                        <ChevronLeft size={18} className="transition-transform duration-300" />
                    ) : (
                        <ChevronRight size={18} className="transition-transform duration-300" />
                    )}
                </button>

                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
                        <div className={`flex items-center gap-2 ${isRTL ? "mr-0" : "ml-10"} lg:${isRTL ? "ml-0" : "ml-10"}`}>
                            <Bot className="h-6 w-6 text-primary" />
                            <span className="text-lg font-semibold text-sidebar-foreground">
                                {t("assistant.title")}
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
