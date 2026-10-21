import { expect, test } from "@playwright/test";

const publicPages = [
  "/", "/explore", "/destinations", "/destinations?view=map", "/destinations?view=routes",
  "/categories", "/gallery", "/about", "/routes/golden-triangle",
  "/routes/kerala-seven-day", "/routes/northeast-green-triangle", "/routes/sikkim-darjeeling",
  "/destinations/taj-mahal", "/memories/mist-over-munnar", "/photo-credits", "/privacy", "/terms",
];

test("main public pages load without browser errors", async ({ page }) => {
  test.setTimeout(120_000);
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(`${page.url()}: ${error.message}`));
  for (const path of publicPages) {
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response?.status(), `${path} should load`).toBe(200);
    await expect(page.locator("h1").first(), `${path} should show a heading`).toBeVisible();
  }
  expect(pageErrors).toEqual([]);
});

test("private areas show sign-in rather than a server error", async ({ page }) => {
  for (const path of ["/journal", "/saved", "/settings", "/plan"]) {
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response?.status(), `${path} should load`).toBe(200);
    await expect(page.getByRole("link", { name: /log in|sign in/i }).first()).toBeVisible();
  }
});

test("destination search, map, and circuits work", async ({ page }) => {
  await page.goto("/destinations");
  await page.getByRole("textbox", { name: "Search destinations" }).fill("Taj Mahal");
  await expect(page.getByRole("heading", { name: "Taj Mahal", exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Explore the map/i }).click();
  await expect(page.getByRole("heading", { name: /visible pins/i })).toBeVisible();
  await page.getByRole("button", { name: /Ready-made circuits/i }).click();
  await expect(page.getByRole("heading", { name: /Build from a real circuit/i })).toBeVisible();
  await page.getByRole("link", { name: /Open full roadmap/i }).first().click();
  await expect(page).toHaveURL(/\/routes\//);
  await expect(page.getByRole("link", { name: /Make this route my trip/i })).toBeVisible();
});

test("home video and key destination photos load", async ({ page, request }) => {
  const clips = ["taj-mahal", "munnar", "amritsar", "ladakh", "cherrapunji", "udaipur", "kerala", "rishikesh", "mumbai"];
  for (const clip of clips) {
    const response = await request.get(`/videos/${clip}.mp4`, { headers: { Range: "bytes=0-1023" } });
    expect([200, 206], `${clip} video should be served`).toContain(response.status());
    expect(response.headers()["content-type"], `${clip} should be an MP4`).toContain("video/mp4");
  }
  await page.goto("/");
  const firstVideo = page.locator("video[src='/videos/taj-mahal.mp4']");
  await expect.poll(async () => firstVideo.evaluate((video: HTMLVideoElement) => video.videoWidth), { timeout: 15_000 }).toBeGreaterThan(0);
  for (const clip of clips) {
    const decoded = await page.evaluate((name) => new Promise<{ width: number; duration: number }>((resolve, reject) => {
      const video = document.createElement("video");
      const timeout = window.setTimeout(() => reject(new Error(`${name} metadata timed out`)), 10_000);
      video.preload = "metadata";
      video.onloadedmetadata = () => { window.clearTimeout(timeout); resolve({ width: video.videoWidth, duration: video.duration }); };
      video.onerror = () => { window.clearTimeout(timeout); reject(new Error(`${name} cannot be decoded`)); };
      video.src = `/videos/${name}.mp4`;
    }), clip);
    expect(decoded.width, `${clip} should contain video frames`).toBeGreaterThan(0);
    expect(decoded.duration, `${clip} should have a usable duration`).toBeGreaterThan(1);
  }
  await page.goto("/destinations/taj-mahal");
  const cover = page.getByRole("img", { name: "Taj Mahal", exact: true }).first();
  await expect.poll(async () => cover.evaluate((image: HTMLImageElement) => image.naturalWidth), { timeout: 15_000 }).toBeGreaterThan(0);
});

test("homepage story and planning images appear on scroll", async ({ page }) => {
  await page.goto("/");
  for (const name of [/Mist, tea/i, /Morning light over Varanasi/i]) {
    const image = page.getByRole("img", { name }).first();
    await image.scrollIntoViewIfNeeded();
    await expect.poll(async () => image.evaluate((element: HTMLImageElement) => element.naturalWidth), { timeout: 15_000 }).toBeGreaterThan(0);
  }
});
