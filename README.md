# L'Atelier Haute Boutique

A production-grade, single-vendor luxury e-commerce platform built with Next.js 15 (App Router), TypeScript, MongoDB, and Razorpay.

## Tech Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS with a custom luxury design token system (emerald / ivory / gold)
- **Database:** MongoDB Atlas + Mongoose
- **Auth:** Auth.js (NextAuth v5) — Google OAuth + Credentials (bcrypt-hashed passwords)
- **Payments:** Razorpay + Cash on Delivery
- **Media:** Cloudinary
- **Validation:** Zod + React Hook Form
- **Animation:** Framer Motion
- **Charts:** Recharts
- **Icons:** Lucide

## Getting Started

### 1. Prerequisites
- Node.js 20+
- A MongoDB Atlas cluster (or local MongoDB / Docker — see below)
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

### 4. Seed the database (optional but recommended)
Populates 5 categories, 12 products (with placeholder images via picsum.photos),
2 coupon codes, an admin account, and a demo customer account:
```bash
npm run seed
```
This prints the admin and demo customer credentials to the console when done.
**Placeholder images are for local development only** — replace with real
Cloudinary uploads through the admin dashboard before going to production,
and remove `picsum.photos` from `next.config.ts`'s `images.remotePatterns`
once you do.

### 5. Run the dev server
```bash
npm run dev
```
Visit http://localhost:3000. Sign in to `/admin` with the seeded admin
credentials to manage the catalog.

### 6. Type-check, lint, and build
```bash
npm run typecheck
npm run lint
npm run build
```

## Running with Docker

A multi-stage `Dockerfile` (Next.js standalone output) and `docker-compose.yml`
(app + MongoDB) are included for local development or self-hosted deployment:

```bash
cp .env.example .env.local   # fill in real values first
docker compose up --build
```

The compose file points the app at the bundled MongoDB container automatically.
For production, build and push the image to your registry and supply real
environment variables at runtime — the Dockerfile only bakes in placeholder
values needed for `next build` to evaluate successfully; no real secrets are
stored in the image.

## Continuous Integration

`.github/workflows/ci.yml` runs on every push/PR to `main`: type-check, lint,
`npm audit --audit-level=high`, and a full production build.

## Project Structure

```
app/                    # Next.js App Router routes, layouts, API routes
  (storefront pages)     # /, /shop, /category/[slug], /product/[slug], /cart, /checkout, ...
  account/                # Customer account: profile, orders, addresses
  admin/                  # Admin dashboard: products, categories, orders, customers, coupons, reviews
  api/                    # REST API routes (see lib/services for the business logic behind them)

lib/                    # Server-side utilities and integrations
  db.ts                   # MongoDB/Mongoose connection singleton
  auth.ts                 # Full NextAuth config (Node runtime — DB + bcrypt)
  auth.config.ts          # Edge-safe NextAuth config (shared by middleware)
  auth-edge.ts             # Edge NextAuth instance for middleware only
  cloudinary.ts            # Image upload/delete helpers
  razorpay.ts               # Order creation + signature verification (lazily initialized)
  invoice.ts                # PDF invoice generation (pdf-lib)
  email.ts                  # Nodemailer + HTML templates
  validators.ts              # Zod schemas for every form/API input
  rate-limit.ts              # Upstash-backed rate limiting (optional, graceful fallback)
  utils.ts                    # Formatting, slugs, order numbers, pagination
  services/                   # Business logic layer (MVC/service pattern)
    product.service.ts, category.service.ts, cart.service.ts, order.service.ts,
    coupon.service.ts, review.service.ts, user.service.ts, auth.service.ts,
    analytics.service.ts

models/                 # Mongoose schemas: User, Product, Category, Order, Review, Coupon, Cart

components/             # Shared React components (layout, shop, cart, checkout, account, admin)
middleware.ts           # Role-based route protection (admin/account/checkout)
types/                  # Ambient type augmentation (NextAuth session/JWT)
scripts/seed.ts         # Database seed script (npm run seed)
```

## Why the auth config is split in two

Next.js middleware runs on the **Edge Runtime**, which cannot bundle Mongoose or bcrypt (both rely on Node APIs). To keep role-based route protection working in middleware without breaking the build:

- `lib/auth.config.ts` — Edge-safe: OAuth provider only, no database calls. Used by `lib/auth-edge.ts` for middleware.
- `lib/auth.ts` — Full Node-runtime config: adds the Credentials provider (bcrypt password checks) and all database-backed callbacks. Used by the API route handler and everywhere else in the app (server components, server actions, route handlers).

## Why some routes are forced dynamic

Pages that read live data directly from the service layer at render time
(the homepage, and the entire `/admin` dashboard) are marked
`export const dynamic = "force-dynamic"`. Without this, Next.js attempts to
statically prerender them at build time, which (a) requires database
connectivity during the build itself, and (b) would serve stale stock/pricing
or stale dashboard numbers to every visitor until the next rebuild — both
wrong for this kind of data. Routes with a dynamic segment or `searchParams`
(shop, category, product, checkout flows) are dynamic automatically.

## Security

- Passwords hashed with bcrypt, never stored or logged in plaintext
- HttpOnly, SameSite, Secure session cookies
- Global security headers (CSP, HSTS, X-Frame-Options, etc.) in `next.config.ts`
- Razorpay payment signatures verified server-side with `crypto.timingSafeEqual`,
  plus a webhook as a server-to-server safety net independent of the client
- Checkout totals are always recalculated server-side from the live cart —
  the client never dictates the charged amount
- Role-based route protection in `middleware.ts` for `/admin`, `/account`, `/checkout`
- Zod validation on every API input
- Optional Upstash-backed rate limiting (falls back to allow-all if not configured, so local dev doesn't require Redis)

## Known Limitations

- Never tested against a real MongoDB Atlas cluster, real Razorpay keys, or
  real Cloudinary credentials — verified structurally (`tsc`, `eslint`,
  `next build`) but not end-to-end against live services or with real traffic.
- Seed script uses picsum.photos placeholder images; swap for real Cloudinary
  uploads before production use.
- No automated tests (unit/integration/e2e) — the CI pipeline currently
  verifies type safety, lint rules, dependency audit, and build success only.
- Loading states exist at the route level (skeletons) but not yet as granular
  per-section Suspense boundaries on the PLP/PDP.

## License

Proprietary — all rights reserved.
