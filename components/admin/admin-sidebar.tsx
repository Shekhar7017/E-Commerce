"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Tag,
  Star,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r border-ink/10 dark:border-ivory/10 min-h-screen flex flex-col">
      <div className="px-6 py-6 border-b border-ink/10 dark:border-ivory/10">
        <Link href="/admin" className="font-display text-lg">
          L&apos;Atelier
        </Link>
        <p className="text-[10px] uppercase tracking-widest2 text-emerald-500 mt-1">
          Admin Console
        </p>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-emerald-600 text-ivory"
                  : "text-ink/70 dark:text-ivory/70 hover:bg-ink/5 dark:hover:bg-ivory/5"
              )}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-6 border-t border-ink/10 dark:border-ivory/10 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-ink/70 dark:text-ivory/70 hover:bg-ink/5 dark:hover:bg-ivory/5"
        >
          <ExternalLink size={16} />
          View Storefront
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-ink/70 dark:text-ivory/70 hover:bg-ink/5 dark:hover:bg-ivory/5"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
