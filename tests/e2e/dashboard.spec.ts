import { expect, test } from "@playwright/test";

test("dashboard shows repeat-study surfaces", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Tool Calling/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Weak Points" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recent Bookmarks And Notes" })).toBeVisible();
});
