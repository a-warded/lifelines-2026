"use client";

import { AssistantSidebar, AssistantSidebarProvider, useAssistantSidebar } from "@/components/sidebar/assistant-sidebar";
import { Sidebar } from "@/components/sidebar/sidebar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import AilaRealtimeAssistant from "./assistant/page";

function DashboardContent({ children }: { children: React.ReactNode }) {
    const { i18n } = useTranslation();
    const isRTL = i18n.dir() === "rtl";
    const { isCollapsed } = useAssistantSidebar();

    return (
        <main 
            className={`transition-all duration-500 ${
                isRTL 
                    ? `md:mr-64 ${isCollapsed ? "lg:ml-0" : "lg:ml-96 xl:ml-[28rem]"}` 
                    : `md:ml-64 ${isCollapsed ? "lg:mr-0" : "lg:mr-96 xl:mr-[28rem]"}`
            }`}
            style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
        >
            <div 
                className={`p-4 md:p-8 relative transition-all duration-500 ${
                    isCollapsed ? "max-w-6xl mx-auto" : ""
                }`}
                style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
            >
                {children}
            </div>
        </main>
    );
}

function DashboardInner({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Sidebar />
            <AssistantSidebar>
                <AilaRealtimeAssistant />
            </AssistantSidebar>
            <DashboardContent>{children}</DashboardContent>
        </>
    );
}

export default function DashboardLayout({
    children,
}: {
  children: React.ReactNode;
}) {
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    if (status === "unauthenticated") {
        return null;
    }

    return (
        <AssistantSidebarProvider>
            <div className="min-h-screen bg-background">
                <DashboardInner>{children}</DashboardInner>
            </div>
        </AssistantSidebarProvider>
    );
}
