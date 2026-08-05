import { test, expect } from "@playwright/test";

// These tests assume `npm run seed` has been run against the database the
// dev/build server is pointed at, which creates a known set of products
// and categories (see scripts/seed.ts).

test.describe("Catalog browsing (requires npm run seed)", () => {
  test("shop page lists seeded products", async ({ page }) => {
    await page.goto("/shop");
    await expect(page.getByRole("heading", { name: "Shop" })).toBeVisible();

    // At least one product card link should be present.
    const productLinks = page.locator('a[href^="/product/"]');
    await expect(productLinks.first()).toBeVisible({ timeout: 10000 });
  });

  test("filtering by category updates the product grid", async ({ page }) => {
    await page.goto("/shop");
    const firstCategoryFilter = page
      .locator("aside")
      .getByRole("button")
      .first();
    await firstCategoryFilter.click();

    await expect(page).toHaveURL(/category=/);
  });

  test("sorting changes the query string", async ({ page }) => {
    await page.goto("/shop");
    await page.getByRole("combobox").selectOption("price_asc");
    await expect(page).toHaveURL(/sort=price_asc/);
  });

  test("clicking a product card navigates to its detail page", async ({ page }) => {
    await page.goto("/shop");
    const firstProduct = page.locator('a[href^="/product/"]').first();
    await firstProduct.click();

    await expect(page).toHaveURL(/\/product\//);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // Price should be visible somewhere on the page
    await expect(page.getByText(/₹/).first()).toBeVisible();
  });

  test("category pages load and show only that category's products", async ({ page }) => {
    await page.goto("/");
    const categoryLink = page.locator('a[href^="/category/"]').first();
    await categoryLink.click();

    await expect(page).toHaveURL(/\/category\//);
    const productLinks = page.locator('a[href^="/product/"]');
    await expect(productLinks.first()).toBeVisible({ timeout: 10000 });
  });
});
