"use client";

import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 ">Welcome back, {session?.user?.name}!</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Stats cards */}
        <div className="rounded-xl bg-card p-6">
          <h3 className="text-sm font-medium ">Total Users</h3>
          <p className="mt-2 text-3xl font-bold text-foreground">1,234</p>
          <p className="mt-1 text-sm text-chart-1">+12% from last month</p>
        </div>

        <div className="rounded-xl bg-card p-6">
          <h3 className="text-sm font-medium ">Active Sessions</h3>
          <p className="mt-2 text-3xl font-bold text-foreground">567</p>
          <p className="mt-1 text-sm text-chart-1">+5% from last hour</p>
        </div>

        <div className="rounded-xl bg-card p-6">
          <h3 className="text-sm font-medium ">Revenue</h3>
          <p className="mt-2 text-3xl font-bold text-foreground">$12,345</p>
          <p className="mt-1 text-sm text-destructive">-2% from last month</p>
        </div>
      </div>

      {/* Recent activity */}
      <div className="rounded-xl bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
        <div className="mt-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-border pb-4 last:border-0"
            >
              <div className="h-10 w-10 rounded-full bg-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">User action {i}</p>
                <p className="text-xs ">2 minutes ago</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
