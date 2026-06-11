import { expect, test } from "@playwright/test";

test("self-test status controls support weak-point review", async ({ page }) => {
  await page.goto("/docs/04-tool-calling");
  await expect(page.getByRole("button", { name: "Not yet" }).first()).toBeVisible();

  await page.goto("/review");
  await expect(page.getByRole("heading", { name: "Review" })).toBeVisible();
  await expect(page.getByText("未掌握")).toBeVisible();
});
