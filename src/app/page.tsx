import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4">
      <main className="text-center">
        <h1 className="text-5xl font-bold text-white">Lifelines</h1>
        <p className="mt-4 text-xl text-zinc-400">
          Welcome to Lifelines 2026
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          {session ? (
            <Link
              href="/dashboard"
              className="rounded-lg bg-blue-600 px-8 py-3 font-medium text-white transition-colors hover:bg-blue-700"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg bg-blue-600 px-8 py-3 font-medium text-white transition-colors hover:bg-blue-700"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-lg border border-zinc-700 px-8 py-3 font-medium text-white transition-colors hover:bg-zinc-800"
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
