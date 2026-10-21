import { expect, test } from "@playwright/test";

test("visitor can move from the homepage to explore", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Discover India/i })).toBeVisible();
  await page.getByRole("link", { name: /Explore destinations/i }).first().click();
  await expect(page).toHaveURL(/destinations/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: /Where to next/i })).toBeVisible();
});

test("mobile navigation exposes primary links", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile");
  await page.goto("/");
  const menu = page.getByRole("button", { name: /open navigation/i });
  await menu.click();
  await expect(page.getByRole("button", { name: /close navigation/i })).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("link", { name: /My journal/i })).toBeVisible();
});

test("public destination, story, and account pages load", async ({ page }) => {
  await page.goto("/destinations/taj-mahal");
  await expect(page.getByRole("heading", { name: /Taj Mahal/i }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Plan a trip here/i })).toHaveAttribute("href", "/plan?destination=taj-mahal");
  await page.goto("/memories/mist-over-munnar");
  await expect(page.getByText(/Sample story for exploring TRAVELY/i)).toBeVisible();
  await expect(page.getByRole("button", { name: "Like" })).toHaveCount(0);
  await page.goto("/auth/sign-up");
  await expect(page.getByRole("heading", { name: /Begin your travel journal/i })).toBeVisible();
});

test("trip planning asks signed-out visitors to log in", async ({ page }) => {
  await page.goto("/plan");
  await expect(page.getByRole("heading", { name: /Plan your next journey/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Log in to plan/i })).toBeVisible();
});
