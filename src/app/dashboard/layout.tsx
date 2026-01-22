import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Sidebar />
      <main className="md:ml-64">
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
