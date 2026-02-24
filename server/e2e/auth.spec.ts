import { test, expect } from "@playwright/test";

const frontendUrl = "http://localhost:5173";
test.describe("Authentication Flow", () => {
  let testEmail: string;
  const testPassword = "Password123!";

  test.beforeEach(({ page }) => {
    testEmail = `testuser-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`;
  });

  test("4. should show Signup link on home page and navigate to it", async ({ page }) => {
    await page.goto(frontendUrl);

    const signupLink = page.getByRole("link", { name: "S'inscrire", exact: true });
    await expect(signupLink).toBeVisible();

    await signupLink.click();

    await expect(page).toHaveURL(/\/register/);
  });

  test("5. should fill registration form and show success message", async ({ page }) => {
    await page.goto(`${frontendUrl}/register`, { waitUntil: "networkidle" });

    await page.waitForFunction(() => (window as any).useNuxtApp !== undefined);

    await page.locator("#email-address").fill(testEmail);
    await page.locator("#password").fill(testPassword);
    await page.locator("#confirm-password").fill(testPassword);

    await page.getByRole("button", { name: "S'inscrire", exact: true }).click();

    const response = await page.waitForResponse((res) => res.url().indexOf("/api/users") !== -1 && res.request().method() === "POST");

    const status = response.status();
    const body = await response.text();

    if (status >= 400) {
      throw new Error(`Server returned error ${status}: ${body}`);
    }

    await expect(page.getByText(/Compte créé avec succès/i)).toBeVisible({ timeout: 15000 });

    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test("6. should login and display the dashboard", async ({ page }) => {
    await page.goto(`${frontendUrl}/register`, { waitUntil: "networkidle" });
    await page.waitForFunction(() => (window as any).useNuxtApp !== undefined);

    await page.locator("#email-address").fill(testEmail);
    await page.locator("#password").fill(testPassword);
    await page.locator("#confirm-password").fill(testPassword);
    await page.getByRole("button", { name: "S'inscrire", exact: true }).click();

    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

    await page.goto(`${frontendUrl}/login`, { waitUntil: "networkidle" });
    await page.waitForFunction(() => (window as any).useNuxtApp !== undefined);

    await page.locator("#email-address").fill(testEmail);
    await page.locator("#password").fill(testPassword);

    await page.getByRole("button", { name: /Se connecter/i }).click();

    await expect(page).toHaveURL(frontendUrl + "/");

    const addButton = page.getByRole("button", { name: /Ajouter/i });
    await expect(addButton).toBeVisible();
  });
});
