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

  const firstSaveButton = page.locator(".save-button").first();
  await firstSaveButton.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#set-list-count")).toHaveText("1");
  await expect(firstSaveButton).toBeFocused();

  const firstDetailsButton = page.locator(".details-button").first();
  await firstDetailsButton.click();
  await expect(page.locator("#detail-dialog")).toBeVisible();
  await page.locator("#detail-save").click();
  await page.locator("#close-detail").click();
  await expect(firstDetailsButton).toBeFocused();

  await page.locator("button[data-view=hall]").click();
  await expect(page.locator("#hall-view")).toBeVisible();
  await expect(page.locator("#hall-view [data-immersive-results]")).toBeHidden();
  await page.locator("#hall-view [data-zone=knowledge]").click();
  await expect(page.locator("#hall-view [data-immersive-results]")).toBeVisible();
  await expect(page.locator("#hall-view .resource-card").first()).toBeVisible();
  await page.locator("#hall-view [data-exit-immersive]").click();
  await expect(page.locator("#cards-view")).toBeVisible();

  await page.locator("button[data-view=studio]").click();
  await expect(page.locator("#studio-view")).toBeVisible();
  await page.locator("#studio-view [data-zone=artistic]").click();
  await expect(page.locator("#studio-view [data-immersive-results]")).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("resources remain usable when browser storage is unavailable", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException("Storage disabled", "SecurityError"); };
  });
  await page.goto("/");
  await expect(page.locator(".resource-card")).toHaveCount(19);
  await page.locator(".save-button").first().click();
  await expect(page.locator("#set-list-count")).toHaveText("1");
});
