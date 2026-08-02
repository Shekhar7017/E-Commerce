import type { Metadata } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "L'Atelier Haute Boutique | Curated Luxury, Delivered",
    template: "%s | L'Atelier Haute Boutique",
  },
  description:
    "L'Atelier Haute Boutique is a single-vendor luxury boutique offering curated apparel, accessories, and objects crafted with uncompromising quality.",
  keywords: [
    "luxury boutique",
    "haute couture",
    "premium fashion",
    "designer accessories",
  ],
  authors: [{ name: "L'Atelier Haute Boutique" }],
  openGraph: {
    type: "website",
    siteName: "L'Atelier Haute Boutique",
    title: "L'Atelier Haute Boutique | Curated Luxury, Delivered",
    description:
      "Curated apparel, accessories, and objects crafted with uncompromising quality.",
    url: siteUrl,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "L'Atelier Haute Boutique",
    description:
      "Curated apparel, accessories, and objects crafted with uncompromising quality.",
    images: ["/og-image.jpg"],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fraunces.variable} ${inter.variable} ${plexMono.variable}`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
