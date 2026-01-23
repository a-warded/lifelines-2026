"use client";

import { Droplets, Leaf, MessageCircle, RefreshCw, Sprout } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();

  const features = [
    {
      icon: Sprout,
      title: "Personalized Plans",
      description: "Get farming recommendations based on your water, space, and sunlight",
    },
    {
      icon: RefreshCw,
      title: "Community Exchange",
      description: "Share seeds, surplus produce, and tools with neighbors",
    },
    {
      icon: Droplets,
      title: "Water Calculator",
      description: "Know exactly how much water your crops need",
    },
    {
      icon: MessageCircle,
      title: "AI Assistant",
      description: "Get instant help with voice or text questions",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <Leaf className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
            Community Farming
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Grow food together. Build resilience. Share with your community.
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            A platform for micro-farmers on rooftops, balconies, and small plots
            to coordinate and thrive.
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
                  className="rounded-lg border border-border bg-background px-8 py-3 font-medium transition-colors hover:bg-card"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid max-w-4xl gap-6 px-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-card p-6 text-center"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Low-resource note */}
        <div className="mt-12 max-w-md rounded-lg bg-amber-50 p-4 text-center dark:bg-amber-950">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Designed for resilience:</strong> Works offline, uses
            minimal data, and supports voice for low-literacy access.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        <p>Built for community food resilience</p>
      </footer>
    </div>
  );
}
