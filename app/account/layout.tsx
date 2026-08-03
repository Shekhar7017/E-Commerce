import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

const NAV = [
  { href: "/account", label: "Profile" },
  { href: "/account/orders", label: "Order History" },
  { href: "/account/addresses", label: "Address Book" },
  { href: "/wishlist", label: "Wishlist" },
];

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account");

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-12">
        <p className="label-eyebrow mb-3">My Account</p>
        <h1 className="font-display text-4xl">
          Welcome, {session.user.name?.split(" ")[0]}
        </h1>
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        <nav className="md:w-56 shrink-0 space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm text-ink/70 dark:text-ivory/70 hover:bg-ink/5 dark:hover:bg-ivory/5 hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex-1">{children}</div>
      </div>
    </main>
  );
}
