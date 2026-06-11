import { expect, test } from "@playwright/test";

test("reader includes toc, notes, bookmarks, mermaid fallback, and self-test controls", async ({ page }) => {
  await page.goto("/docs/04-tool-calling");

  await expect(page.getByRole("navigation", { name: "Table of contents" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Bookmark" }).first()).toBeVisible();
  await expect(page.getByText("Mermaid")).toBeVisible();
  await expect(page.getByRole("region", { name: "Self test" })).toBeVisible();
});
