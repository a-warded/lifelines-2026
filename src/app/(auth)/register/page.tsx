"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Something went wrong");
            } else {
                // Auto sign in after registration
                const result = await signIn("credentials", {
                    email,
                    password,
                    redirect: false,
                });

                if (result?.ok) {
                    router.push("/onboarding");
                } else {
                    // Fallback to login if auto-signin fails
                    router.push("/login?registered=true");
                }
            }
        } catch {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-foreground">{t("auth.register.title")}</h1>
                    <p className="mt-2 ">{t("auth.register.subtitle")}</p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    {error && (
                        <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium ">
                                {t("auth.register.nameLabel")}
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="mt-1 block w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground placeholder: focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                placeholder={t("auth.register.namePlaceholder")}
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium ">
                                {t("auth.register.emailLabel")}
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="mt-1 block w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground placeholder: focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                placeholder={t("auth.register.emailPlaceholder")}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium ">
                                {t("auth.register.passwordLabel")}
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="mt-1 block w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground placeholder: focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                placeholder={t("auth.register.passwordPlaceholder")}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? t("common.loading") : t("auth.register.submitButton")}
                    </button>

                    <p className="text-center text-sm ">
                        {t("auth.register.hasAccount")}{" "}
                        <Link href="/login" className="font-medium text-primary hover:text-primary-foreground">
                            {t("auth.register.loginLink")}
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
