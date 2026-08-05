import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("a new customer can register and lands on their account page", async ({ page }) => {
    const uniqueEmail = `e2e-${Date.now()}@example.com`;

    await page.goto("/register");
    await page.getByPlaceholder("Full name").fill("E2E Test Customer");
    await page.getByPlaceholder("Email address").fill(uniqueEmail);
    await page.getByPlaceholder("Password").fill("Password123");
    await page.getByRole("button", { name: "Create Account" }).click();

    await expect(page).toHaveURL(/\/account/, { timeout: 15000 });
    await expect(page.getByText(/welcome/i)).toBeVisible();
  });

  test("registering with an already-used email shows an error, not a crash", async ({ page }) => {
    const email = `e2e-dupe-${Date.now()}@example.com`;

    // First registration should succeed
    await page.goto("/register");
    await page.getByPlaceholder("Full name").fill("First User");
    await page.getByPlaceholder("Email address").fill(email);
    await page.getByPlaceholder("Password").fill("Password123");
    await page.getByRole("button", { name: "Create Account" }).click();
    await expect(page).toHaveURL(/\/account/, { timeout: 15000 });

    // Sign out, then try registering the same email again
    await page.getByRole("button", { name: "Sign out" }).click();
    await page.goto("/register");
    await page.getByPlaceholder("Full name").fill("Second User");
    await page.getByPlaceholder("Email address").fill(email);
    await page.getByPlaceholder("Password").fill("Password123");
    await page.getByRole("button", { name: "Create Account" }).click();

    // Should stay on register (or redirect to login) with an error toast,
    // never a 500 or an unhandled exception page.
    await expect(page.getByText(/already exists/i)).toBeVisible({ timeout: 10000 });
  });

  test("login with wrong password shows an error", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("Email address").fill("nonexistent@example.com");
    await page.getByPlaceholder("Password").fill("WrongPassword123");
    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page.getByText(/invalid email or password/i)).toBeVisible({
      timeout: 10000,
    });
    // Must not have navigated away from /login
    await expect(page).toHaveURL(/\/login/);
  });

  test("forgot password form submits without error for any email (no enumeration)", async ({
    page,
  }) => {
    await page.goto("/forgot-password");
    await page.getByPlaceholder("Email address").fill("doesnotexist@example.com");
    await page.getByRole("button", { name: "Send Reset Link" }).click();

    await expect(page.getByText(/check your inbox/i)).toBeVisible({ timeout: 10000 });
  });
});
