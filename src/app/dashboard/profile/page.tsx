"use client";

import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        <p className="mt-1 ">Manage your account settings</p>
      </div>

      <div className="rounded-xl bg-card p-6">
        <div className="flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
            {session?.user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">{session?.user?.name}</h2>
            <p className="">{session?.user?.email}</p>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium ">Name</label>
            <input
              type="text"
              defaultValue={session?.user?.name || ""}
              className="mt-1 block w-full max-w-md rounded-lg border border-border bg-input px-4 py-3 text-foreground placeholder: focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium ">Email</label>
            <input
              type="email"
              defaultValue={session?.user?.email || ""}
              disabled
              className="mt-1 block w-full max-w-md rounded-lg border border-border bg-input px-4 py-3  placeholder: focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <button className="rounded-lg bg-primary px-6 py-2.5 font-medium text-primary-foreground transition-colors hover:opacity-90">
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
