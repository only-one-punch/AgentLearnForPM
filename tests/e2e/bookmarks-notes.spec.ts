import { expect, test } from "@playwright/test";

test("bookmarks and notes are reachable from reader and saved page", async ({ page }) => {
  await page.goto("/docs/04-tool-calling");
  await page.getByRole("button", { name: "Bookmark" }).first().click();
  await expect(page.getByRole("button", { name: "Bookmarked" }).first()).toBeVisible();

  await page.goto("/bookmarks");
  await expect(page.getByRole("heading", { name: "Bookmarks And Notes" })).toBeVisible();
  await expect(page.getByText("schema 描述模型能请求什么")).toBeVisible();
});
