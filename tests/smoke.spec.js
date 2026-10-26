const { test, expect } = require("@playwright/test");

test("filters, saves, opens details, and changes view", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", error => pageErrors.push(error.message));

  await page.goto("/");
  await expect(page.locator(".resource-card")).toHaveCount(19);

  if (!await page.locator("button[data-filter=rhythm]").isVisible()) {
    await page.locator("#filter-toggle").click();
  }
  await page.locator("button[data-filter=rhythm]").click();
  await expect(page.locator(".resource-card").first()).toBeVisible();

  await page.locator(".save-button").first().click();
  await expect(page.locator("#set-list-count")).toHaveText("1");

  await page.locator(".details-button").first().click();
  await expect(page.locator("#detail-dialog")).toBeVisible();
  await page.locator("#close-detail").click();

  await page.locator("button[data-view=hall]").click();
  await expect(page.locator("#hall-view")).toBeVisible();
  expect(pageErrors).toEqual([]);
});
