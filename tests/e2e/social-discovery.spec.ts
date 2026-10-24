import { expect, test } from "@playwright/test";

test("signed-out visitors can discover stories but must sign in for Following", async ({ page }) => {
  await page.goto("/explore");
  const feedNavigation = page.getByRole("navigation", { name: "Story feed" });
  await expect(feedNavigation.getByRole("link", { name: "Discover" })).toHaveAttribute("aria-current", "page");
  await feedNavigation.getByRole("link", { name: "Following" }).click();
  await expect(page).toHaveURL(/feed=following/);
  await expect(page.getByText(/Sign in to see stories from travellers you follow/i)).toBeVisible();
  await expect(page.getByRole("status").getByRole("link", { name: "Log in" })).toBeVisible();
});

test("destination pages connect map discovery to community stories", async ({ page }) => {
  await page.goto("/destinations/taj-mahal");
  await expect(page.getByRole("heading", { name: /Stories from Taj Mahal/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "Share your visit" })).toHaveAttribute("href", /\/journal\/new\?destination=/);
});

test("sample stories do not present a live comment form", async ({ page }) => {
  await page.goto("/memories/mist-over-munnar");
  await expect(page.getByRole("heading", { name: /The full story/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Comments/i })).toHaveCount(0);
});
