"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Search, ShoppingBag, User, Heart, Menu, X } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?newArrival=true", label: "New Arrivals" },
  { href: "/shop?bestseller=true", label: "Bestsellers" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { itemCount } = useCart();
  const { data: session } = useSession();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-500",
        scrolled ? "glass-panel" : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between">
        <Link
          href="/"
          className="font-display text-xl md:text-2xl tracking-tight"
        >
          L&apos;Atelier
          <span className="text-emerald-500"> Haute</span>
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm tracking-wide text-ink/70 dark:text-ivory/70 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <Link
            href="/shop"
            aria-label="Search"
            className="hidden sm:inline-flex text-ink/70 dark:text-ivory/70 hover:text-emerald-500 transition-colors"
          >
            <Search size={20} />
          </Link>

          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="hidden sm:inline-flex text-ink/70 dark:text-ivory/70 hover:text-emerald-500 transition-colors"
          >
            <Heart size={20} />
          </Link>

          <Link
            href="/cart"
            aria-label="Cart"
            className="relative text-ink/70 dark:text-ivory/70 hover:text-emerald-500 transition-colors"
          >
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-medium text-ivory">
                {itemCount}
              </span>
            )}
          </Link>

          {session?.user ? (
            <div className="hidden sm:flex items-center gap-4">
              <Link
                href={session.user.role === "admin" ? "/admin" : "/account"}
                aria-label="Account"
                className="text-ink/70 dark:text-ivory/70 hover:text-emerald-500 transition-colors"
              >
                <User size={20} />
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-xs uppercase tracking-widest2 text-ink/50 dark:text-ivory/50 hover:text-emerald-500"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link href="/login" className="hidden sm:inline text-sm">
              Sign in
            </Link>
          )}

          <button
            className="md:hidden text-ink dark:text-ivory"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden glass-panel px-6 pb-6 pt-2 flex flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-sm py-2"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/wishlist" onClick={() => setMobileOpen(false)} className="text-sm py-2">
            Wishlist
          </Link>
          {session?.user ? (
            <>
              <Link
                href={session.user.role === "admin" ? "/admin" : "/account"}
                onClick={() => setMobileOpen(false)}
                className="text-sm py-2"
              >
                Account
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm py-2 text-left text-ink/50 dark:text-ivory/50"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link href="/login" onClick={() => setMobileOpen(false)} className="text-sm py-2">
              Sign in
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
