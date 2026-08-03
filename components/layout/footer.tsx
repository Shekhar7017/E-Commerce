import Link from "next/link";
import { Instagram, Facebook, Twitter } from "lucide-react";

const FOOTER_LINKS = [
  {
    heading: "Shop",
    links: [
      { href: "/shop", label: "All Products" },
      { href: "/shop?newArrival=true", label: "New Arrivals" },
      { href: "/shop?bestseller=true", label: "Bestsellers" },
    ],
  },
  {
    heading: "Account",
    links: [
      { href: "/account/orders", label: "Order History" },
      { href: "/account/addresses", label: "Address Book" },
      { href: "/wishlist", label: "Wishlist" },
    ],
  },
  {
    heading: "Support",
    links: [
      { href: "/contact", label: "Contact Us" },
      { href: "/about", label: "About the Atelier" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-32 border-t border-ink/10 dark:border-ivory/10">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="tape-divider mb-16" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2">
            <p className="font-display text-2xl mb-4">L&apos;Atelier Haute Boutique</p>
            <p className="text-sm text-ink/60 dark:text-ivory/60 max-w-xs leading-relaxed">
              Curated apparel, accessories, and objects crafted with
              uncompromising quality. Every piece, considered.
            </p>
            <div className="flex gap-4 mt-6">
              <Instagram size={18} className="text-ink/50 dark:text-ivory/50" />
              <Facebook size={18} className="text-ink/50 dark:text-ivory/50" />
              <Twitter size={18} className="text-ink/50 dark:text-ivory/50" />
            </div>
          </div>

          {FOOTER_LINKS.map((section) => (
            <div key={section.heading}>
              <p className="label-eyebrow mb-4">{section.heading}</p>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-ink/70 dark:text-ivory/70 hover:text-emerald-500 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-ink/10 dark:border-ivory/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink/40 dark:text-ivory/40">
          <p>© {new Date().getFullYear()} L&apos;Atelier Haute Boutique. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
