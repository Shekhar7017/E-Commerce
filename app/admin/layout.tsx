import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (session.user.role !== "admin") redirect("/");

  return (
    <div className="flex min-h-screen bg-ivory dark:bg-ink">
      <AdminSidebar />
      <div className="flex-1 px-8 py-8 md:px-12 md:py-10 max-w-[1400px]">
        {children}
      </div>
    </div>
  );
}
