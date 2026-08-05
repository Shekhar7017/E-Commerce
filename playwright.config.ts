import { defineConfig, devices } from "@playwright/test";

/**
 * IMPORTANT: These tests require a running dev server backed by a real
 * (seeded) database, and could not be execution-verified in the
 * environment this project was built in - this sandbox has no browser
 * binary available (cdn.playwright.dev is not reachable) and no live
 * MongoDB/Razorpay/Cloudinary credentials to exercise the full flows
 * against. Review carefully on first run.
 *
 * Setup before running:
 *   1. cp .env.example .env.local and fill in real values
 *   2. npm run seed
 *   3. npx playwright install --with-deps   (one-time browser download)
 *   4. npm run test:e2e
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-safari", use: { ...devices["iPhone 14"] } },
  ],
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180000,
  },
});
