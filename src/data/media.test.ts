import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { categoryGuides } from "./category-guides";
import { demoDestinations, demoMemories } from "./demo";
import { commonsCredits } from "@/lib/media-credits";
import commonsSources from "./commons-source-map.json";

const localFile = (url: string) => path.join(process.cwd(), "public", url.slice(1));

describe("curated photo assignments", () => {
  it("uses a distinct cover for each featured destination", () => {
    const covers = demoDestinations.map((destination) => destination.cover_image_url);
    expect(new Set(covers).size).toBe(covers.length);
    for (const cover of covers) expect(existsSync(localFile(cover!))).toBe(true);
  });

  it("has a multi-photo walkthrough for every featured destination", () => {
    for (const destination of demoDestinations) {
      expect(destination.gallery_images?.length).toBeGreaterThanOrEqual(2);
      for (const image of destination.gallery_images ?? []) expect(existsSync(localFile(image))).toBe(true);
    }
  });

  it("uses distinct and credited category photographs", () => {
    expect(new Set(categoryGuides.map((guide) => guide.image)).size).toBe(categoryGuides.length);
    for (const guide of categoryGuides) {
      expect(existsSync(localFile(guide.image))).toBe(true);
      expect(commonsCredits[guide.image]?.source).toMatch(/^https:\/\/commons\.wikimedia\.org\//);
    }
  });

  it("gives every sample story a distinct, credited photo set", () => {
    const images = demoMemories.flatMap((memory) => memory.images ?? []);
    expect(new Set(images.map((image) => image.image_url)).size).toBe(images.length);
    for (const image of images) {
      expect(existsSync(localFile(image.image_url))).toBe(true);
      expect(commonsCredits[image.image_url]?.license).toBeTruthy();
    }
  });

  it("keeps local copies and attribution for every Commons photograph", () => {
    expect(Object.keys(commonsCredits)).toHaveLength(Object.keys(commonsSources).length);
    for (const [url, credit] of Object.entries(commonsCredits)) {
      expect(existsSync(localFile(url))).toBe(true);
      expect(credit.author).toBeTruthy();
      expect(credit.license).toBeTruthy();
      expect(credit.source).toMatch(/^https:\/\/commons\.wikimedia\.org\//);
    }
  });
});
