# L'Atelier Haute Boutique

A production-grade, single-vendor luxury e-commerce platform built with Next.js 15 (App Router), TypeScript, MongoDB, and Razorpay.

> **Build status:** Phase 1 of 5 — project scaffold, database models, and authentication are complete and build-verified. See [Roadmap](#roadmap) below for what's next.

## Tech Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS with a custom luxury design token system (emerald / ivory / gold)
- **Database:** MongoDB Atlas + Mongoose
- **Auth:** Auth.js (NextAuth v5) — Google OAuth + Credentials (bcrypt-hashed passwords)
- **Payments:** Razorpay + Cash on Delivery
- **Media:** Cloudinary
- **Validation:** Zod + React Hook Form
- **Animation:** Framer Motion
- **Icons:** Lucide

## Getting Started

### 1. Prerequisites
- Node.js 20+
- A MongoDB Atlas cluster (or local MongoDB instance)
- A Google Cloud OAuth 2.0 client (for Google sign-in)
- A Cloudinary account
- A Razorpay account (test mode is fine for development)

### 2. Install dependencies
```bash
npm install --legacy-peer-deps
```

### 3. Configure environment variables
Copy `.env.example` to `.env.local` and fill in every value:
```bash
cp .env.example .env.local
```

Generate strong secrets for `AUTH_SECRET`, `JWT_SECRET`, and `JWT_RESET_SECRET`:
```bash
openssl rand -base64 32
```

### 4. Run the dev server
```bash
npm run dev
```
Visit http://localhost:3000.

### 5. Type-check and build
```bash
npm run typecheck
npm run build
```

## Project Structure

```
app/                    # Next.js App Router routes, layouts, API routes
  api/auth/[...nextauth]/  # Auth.js route handler
  globals.css           # Design tokens, base styles, component classes
  layout.tsx            # Root layout (fonts, metadata, providers)
  sitemap.ts / robots.ts

lib/                    # Server-side utilities and integrations
  db.ts                 # MongoDB/Mongoose connection singleton
  auth.ts               # Full NextAuth config (Node runtime — DB + bcrypt)
  auth.config.ts        # Edge-safe NextAuth config (shared by middleware)
  auth-edge.ts           # Edge NextAuth instance for middleware only
  cloudinary.ts          # Image upload/delete helpers
  razorpay.ts             # Order creation + signature verification
  validators.ts           # Zod schemas for every form/API input
  rate-limit.ts          # Upstash-backed rate limiting (optional, graceful fallback)
  utils.ts               # Formatting, slugs, order numbers, pagination

models/                 # Mongoose schemas: User, Product, Category, Order, Review, Coupon, Cart

components/             # Shared React components
middleware.ts           # Role-based route protection (admin/account/checkout)
types/                  # Ambient type augmentation (NextAuth session/JWT)
```

## Why the auth config is split in two

Next.js middleware runs on the **Edge Runtime**, which cannot bundle Mongoose or bcrypt (both rely on Node APIs). To keep role-based route protection working in middleware without breaking the build:

- `lib/auth.config.ts` — Edge-safe: OAuth provider only, no database calls. Used by `lib/auth-edge.ts` for middleware.
- `lib/auth.ts` — Full Node-runtime config: adds the Credentials provider (bcrypt password checks) and all database-backed callbacks. Used by the API route handler and everywhere else in the app (server components, server actions, route handlers).

## Security

- Passwords hashed with bcrypt, never stored or logged in plaintext
- HttpOnly, SameSite, Secure session cookies
- Global security headers (CSP, HSTS, X-Frame-Options, etc.) in `next.config.ts`
- Razorpay payment signatures verified server-side with `crypto.timingSafeEqual`
- Role-based route protection in `middleware.ts` for `/admin`, `/account`, `/checkout`
- Zod validation on every API input
- Optional Upstash-backed rate limiting (falls back to allow-all if not configured, so local dev doesn't require Redis)

## Roadmap

- [x] **Phase 1** — Project scaffold, Tailwind design system, MongoDB models, Auth.js (Google + Credentials), security headers, SEO base (sitemap/robots), 404/500 pages
- [ ] **Phase 2** — REST APIs and Server Actions: products, categories, cart, wishlist, checkout, Razorpay integration, coupons, reviews
- [ ] **Phase 3** — Customer-facing UI: home, PLP/PDP, cart, checkout, account, order history/tracking
- [ ] **Phase 4** — Admin dashboard: product/category/order/customer/coupon/review management, sales analytics
- [ ] **Phase 5** — Dynamic SEO (JSON-LD, canonical URLs), performance polish, Docker, seed data, deployment docs

## License

Proprietary — all rights reserved.
