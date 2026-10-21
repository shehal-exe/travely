import { describe, expect, it } from "vitest";
import { selectWikipediaGalleryImages } from "@/lib/wikipedia-gallery";

describe("Wikipedia destination galleries", () => {
  it("keeps distinct travel photographs and filters interface artwork", () => {
    const cover = "https://commons.wikimedia.org/wiki/Special:FilePath/Gateway_of_India.jpg?width=960";
    const gallery = selectWikipediaGalleryImages([
      { title: "File:Gateway_of_India.jpg", type: "image", showInGallery: true, srcset: [{ src: "//thumb.wikimedia.org/wikipedia/commons/thumb/a/ab/Gateway_of_India.jpg/1280px-Gateway_of_India.jpg" }] },
      { title: "File:Flag_of_India.svg", type: "image", showInGallery: true, srcset: [{ src: "//example.test/flag.png" }] },
      { title: "File:Mumbai_skyline.jpg", type: "image", showInGallery: true, srcset: [{ src: "//thumb.wikimedia.org/wikipedia/commons/thumb/a/ab/Mumbai_skyline.jpg/1280px-Mumbai_skyline.jpg" }] },
      { title: "File:Marine_Drive.png", type: "image", showInGallery: true, srcset: [{ src: "//thumb.wikimedia.org/wikipedia/commons/thumb/a/ab/Marine_Drive.png/1280px-Marine_Drive.png" }] },
    ], cover);

    expect(gallery).toEqual([
      cover,
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ab/Mumbai_skyline.jpg/1280px-Mumbai_skyline.jpg",
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ab/Marine_Drive.png/1280px-Marine_Drive.png",
    ]);
  });
});
