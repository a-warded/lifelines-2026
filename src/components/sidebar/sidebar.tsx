"use client";

import {
    LayoutDashboard,
    LogOut,
    Menu,
    Recycle,
    RefreshCw,
    User,
    X
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FadesLogo } from "../fades-logo";
import SplitText from "../SplitText";

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useTranslation();

    const navItems = [
        { href: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
        { href: "/dashboard/exchange", label: t("nav.exchange"), icon: RefreshCw },
        { href: "/dashboard/compost", label: t("nav.compost", "Composting"), icon: Recycle },
        { href: "/dashboard/profile", label: t("nav.profile"), icon: User },
    ];

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed left-4 top-4 z-50 rounded-lg bg-sidebar-accent p-2 text-sidebar-accent-foreground md:hidden"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 z-40 h-screen w-64 transform bg-sidebar transition-transform duration-300 ease-in-out ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                } md:translate-x-0`}
            >
                <div className="flex h-full flex-col">
                    {/* Logo */}
                    <div className="flex h-16 items-center px-6">
                        <Link href="/" className="flex items-center gap-2">
                            <FadesLogo className="h-14 w-14" fill="var(--primary)" />
                            
                            <SplitText
                                text="FADES"
                                className="text-3xl fades-font mt-1 font-semibold text-center  text-primary"
                                duration={1.25}
                                ease="power3.out"
                                splitType="chars"
                                from={{ opacity: 0, y: 40 }}
                                to={{ opacity: 1, y: 0 }}
                                threshold={0.1}
                                rootMargin="-100px"
                                textAlign="center"
                            />

                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 px-3 py-4">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || 
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex relative items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                                        isActive
                                            ? "text-sidebar-foreground"
                                            : "text-sidebar-foreground hover:text-primary"
                                    }`}
                                >
                                    <img src={"/images/sidebar_deco.webp"} className={`absolute h-full -z-10 left-[2px] transition-opacity duration-300  ${isActive ? "opacity-100" : "opacity-0"}`} />
                                    <Icon className={`h-5 w-5 transition-mr duration-300 mr-${isActive ? "2" : "0"}`}  />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User section */}
                    <div className="border-t border-sidebar-border p-4">
                        {session?.user && (
                            <div className="mb-3 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                    {session.user.name?.charAt(0).toUpperCase() || "U"}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="truncate text-sm font-medium text-sidebar-foreground">
                                        {session.user.name}
                                    </p>
                                    <p className="truncate text-xs ">
                                        {session.user.email}
                                    </p>
                                </div>
                            </div>
                        )}
                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        >
                            <LogOut className="h-5 w-5" />
                            {t("nav.signOut")}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
