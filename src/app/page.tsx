"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <main className="text-center">
        <h1 className="text-5xl font-bold text-foreground">Lifelines</h1>
        <p className="mt-4 text-xl ">
          Welcome to Lifelines 2026
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          {status === "loading" ? (
            <div className="h-12 w-32 animate-pulse rounded-lg bg-card" />
          ) : session ? (
            <Link
              href="/dashboard"
              className="rounded-lg bg-primary px-8 py-3 font-medium text-primary-foreground transition-colors hover:opacity-90"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg bg-primary px-8 py-3 font-medium text-primary-foreground transition-colors hover:opacity-90"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-lg border border-border px-8 py-3 font-medium text-primary-foreground transition-colors hover:bg-card"
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
