"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await signIn("credentials", {
                email,
                password,
                redirect: true,
                redirectTo: "/dashboard",
            });
        } catch {
            setError(t("errors.serverError"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-foreground">{t("auth.login.title")}</h1>
                    <p className="mt-2 ">{t("auth.login.subtitle")}</p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    {error && (
                        <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium ">{t("auth.login.emailLabel")}</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="mt-1 block w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground placeholder: focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                placeholder={t("auth.login.emailPlaceholder")}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium ">{t("auth.login.passwordLabel")}</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="mt-1 block w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground placeholder: focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                placeholder={t("auth.login.passwordPlaceholder")}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? t("common.loading") : t("auth.login.submitButton")}
                    </button>

                    <p className="text-center text-sm ">
                        {t("auth.login.noAccount")}{" "}
                        <Link href="/register" className="font-medium text-primary hover:text-primary-foreground">{t("auth.login.registerLink")}</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
