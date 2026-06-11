import { expect, test } from "@playwright/test";

test.describe("workbench smoke", () => {
  test.skip("redirects unauthenticated users to login once backend auth guard is wired", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });

  test("exposes main navigation for an authenticated workbench session", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Workbench navigation" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Library" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Settings" })).toBeVisible();
  });
});
