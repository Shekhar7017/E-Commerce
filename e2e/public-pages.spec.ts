import { test, expect } from "@playwright/test";

test.describe("Public navigation", () => {
  test("homepage loads and shows the hero", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page).toHaveTitle(/L'Atelier Haute Boutique/);
  });

  test("header navigation links are present and functional", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Shop", exact: true }).first().click();
    await expect(page).toHaveURL(/\/shop/);
    await expect(page.getByRole("heading", { name: "Shop" })).toBeVisible();
  });

  test("footer legal links resolve", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Privacy" }).click();
    await expect(page).toHaveURL(/\/privacy/);
    await expect(page.getByRole("heading", { name: "Privacy Policy" })).toBeVisible();
  });

  test("unknown route shows the custom 404 page", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByText(/lost the thread/i)).toBeVisible();
  });

  test("about, contact, terms pages load", async ({ page }) => {
    for (const path of ["/about", "/contact", "/terms"]) {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
    }
  });

  test("sitemap.xml and robots.txt are served", async ({ page }) => {
    const sitemapResponse = await page.goto("/sitemap.xml");
    expect(sitemapResponse?.status()).toBe(200);
    expect(await sitemapResponse?.headerValue("content-type")).toContain("xml");

    const robotsResponse = await page.goto("/robots.txt");
    expect(robotsResponse?.status()).toBe(200);
  });
});

test.describe("Route protection (middleware)", () => {
  test("visiting /account while signed out redirects to /login", async ({ page }) => {
    await page.goto("/account");
    await expect(page).toHaveURL(/\/login/);
    expect(new URL(page.url()).searchParams.get("callbackUrl")).toBe("/account");
  });

  test("visiting /checkout while signed out redirects to /login", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page).toHaveURL(/\/login/);
  });

  test("visiting /admin while signed out redirects to /login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
    expect(new URL(page.url()).searchParams.get("callbackUrl")).toBe("/admin");
  });
});
