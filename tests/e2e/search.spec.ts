import { expect, test } from "@playwright/test";

test("search and terminology lookup expose private result UI", async ({ page }) => {
  await page.goto("/search?q=tool schema");
  await page.getByPlaceholder("tool schema, 权限, eval").fill("tool schema");
  await expect(page.getByText("Tool Schema")).toBeVisible();

  await page.goto("/terms");
  await page.getByPlaceholder("Filter terms").fill("权限");
  await expect(page.getByText("权限边界")).toBeVisible();
});
