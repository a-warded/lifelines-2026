"use client";

import { Badge, Button, Card, CardContent, OfflineBadge } from "@/components/ui";
import { cachePlan, getCachedPlan } from "@/lib/offline-storage";
import {
  ArrowRight,
  Calculator,
  Droplets,
  Leaf,
  MessageCircle,
  RefreshCw,
  Sprout,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface PlanPreview {
  id: string;
  recommendedCrops: Array<{
    cropName: string;
    difficulty: string;
  }>;
  estimatedDailyWaterLiters: number;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [latestPlan, setLatestPlan] = useState<PlanPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoLoading, setDemoLoading] = useState(false);

  const showDemo = searchParams.get("demo") === "true";

  const fetchLatestPlan = useCallback(async () => {
    try {
      const res = await fetch("/api/plans");
      if (res.ok) {
        const data = await res.json();
        if (data.plan) {
          setLatestPlan(data.plan);
          cachePlan(data.plan);
        }
      }
    } catch {
      // Try cached data
      const cached = getCachedPlan<PlanPreview>();
      if (cached) {
        setLatestPlan(cached);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLatestPlan();
  }, [fetchLatestPlan]);

  const loadDemoData = async () => {
    setDemoLoading(true);
    try {
      const res = await fetch("/api/demo", { method: "POST" });
      if (res.ok) {
        await fetchLatestPlan();
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to load demo data:", error);
    } finally {
      setDemoLoading(false);
    }
  };

  const features = [
    {
      title: "Get Farming Plan",
      description: "Personalized plan based on your conditions",
      href: "/dashboard/plan/new",
      icon: Sprout,
      color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    },
    {
      title: "Exchange Seeds & Surplus",
      description: "Share and find resources in your community",
      href: "/dashboard/exchange",
      icon: RefreshCw,
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    },
    {
      title: "Water Calculator",
      description: "Calculate water needs for your crops",
      href: "/dashboard/water",
      icon: Droplets,
      color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300",
    },
    {
      title: "Assistant",
      description: "Get help with farming questions",
      href: "/dashboard/assistant",
      icon: MessageCircle,
      color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Welcome back{session?.user?.name ? `, ${session.user.name}` : ""}!
          </h1>
          <p className="mt-1 text-muted-foreground">
            Grow food, build resilience, share with your community.
          </p>
        </div>
        {showDemo && (
          <Button
            onClick={loadDemoData}
            loading={demoLoading}
            variant="outline"
            className="shrink-0"
          >
            <Calculator className="mr-2 h-4 w-4" />
            Load Demo Data
          </Button>
        )}
      </div>

      {/* Quick Actions Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link key={feature.href} href={feature.href}>
              <Card className="group h-full cursor-pointer transition-all hover:border-primary hover:shadow-md">
                <CardContent className="flex items-start gap-4">
                  <div className={`rounded-xl p-3 ${feature.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground group-hover:text-primary">
                      {feature.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Latest Plan Preview */}
      {!loading && latestPlan && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardContent>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <h3 className="font-semibold text-green-800 dark:text-green-200">
                    Your Latest Farming Plan
                  </h3>
                </div>
                <p className="mt-2 text-sm text-green-700 dark:text-green-300">
                  Recommended crops:{" "}
                  {latestPlan.recommendedCrops.map((c, i) => (
                    <span key={c.cropName}>
                      {i > 0 && ", "}
                      <strong>{c.cropName}</strong>
                    </span>
                  ))}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <Badge variant="info">
                    <Droplets className="mr-1 h-3 w-3" />
                    {latestPlan.estimatedDailyWaterLiters}L/day
                  </Badge>
                  <span className="text-xs text-green-600 dark:text-green-400">
                    Created{" "}
                    {new Date(latestPlan.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Link href={`/dashboard/plan/${latestPlan.id}`}>
                <Button size="sm" variant="outline">
                  View Plan
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Getting Started */}
      {!loading && !latestPlan && (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <Sprout className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">
              Ready to Start Growing?
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Create your personalized farming plan based on your space, water
              access, and goals.
            </p>
            <div className="mt-6">
              <Link href="/dashboard/plan/new">
                <Button size="lg">
                  <Sprout className="mr-2 h-5 w-5" />
                  Get Your Farming Plan
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <OfflineBadge />
    </div>
  );
}
