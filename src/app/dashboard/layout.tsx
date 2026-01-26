"use client";

import { AssistantSidebar } from "@/components/sidebar/assistant-sidebar";
import { Sidebar } from "@/components/sidebar/sidebar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import AilaRealtimeAssistant from "./assistant/page";

export default function DashboardLayout({
    children,
}: {
  children: React.ReactNode;
}) {
    const { status } = useSession();
    const router = useRouter();
    const { i18n } = useTranslation();
    const isRTL = i18n.dir() === "rtl";

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
        <div className="min-h-screen bg-background">
            <Sidebar />
            <main className={`${isRTL ? "md:mr-64 lg:ml-96 xl:ml-[28rem]" : "md:ml-64 lg:mr-96 xl:mr-[28rem]"}`}>
                <div className="p-4 md:p-8 relative">{children}</div>
            </main>
            <AssistantSidebar>
                <AilaRealtimeAssistant />
            </AssistantSidebar>
        </div>
    );
}
