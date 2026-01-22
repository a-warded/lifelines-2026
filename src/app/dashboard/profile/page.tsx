"use client";

import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Profile</h1>
        <p className="mt-1 text-zinc-400">Manage your account settings</p>
      </div>

      <div className="rounded-xl bg-zinc-900 p-6">
        <div className="flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-3xl font-bold text-white">
            {session?.user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">
              {session?.user?.name}
            </h2>
            <p className="text-zinc-400">{session?.user?.email}</p>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300">
              Name
            </label>
            <input
              type="text"
              defaultValue={session?.user?.name || ""}
              className="mt-1 block w-full max-w-md rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300">
              Email
            </label>
            <input
              type="email"
              defaultValue={session?.user?.email || ""}
              disabled
              className="mt-1 block w-full max-w-md rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-zinc-500 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-blue-700">
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
