import type { Destination } from "@/types/database";

type WikipediaMediaItem = {
  title?: string;
  type?: string;
  showInGallery?: boolean;
  srcset?: { src?: string; scale?: string }[];
};

type CommonsSearchPage = {
  title?: string;
  imageinfo?: { thumburl?: string; url?: string }[];
};

const unwantedMedia = /(flag|logo|emblem|seal|coat[ _-]of[ _-]arms|locator|location[ _-]map|\bmaps?\b|states?[ _-]and[ _-]union[ _-]territories|icon|symbol|diagram|chart|graph|temperature|population|commons|coin|currency|stamp|obverse|reverse)/i;

function fileNameFromUrl(value: string | null | undefined) {
  if (!value) return "";
  const specialFile = value.match(/Special:FilePath\/([^?]+)/i)?.[1];
  const thumbFile = value.match(/\/thumb\/[a-f0-9]\/[a-f0-9]{2}\/([^/]+)\//i)?.[1];
  const uploadFile = value.match(/\/commons\/[a-f0-9]\/[a-f0-9]{2}\/([^?]+)/i)?.[1];
  const match = specialFile ?? thumbFile ?? uploadFile ?? "";
  try {
    return decodeURIComponent(match).replaceAll("_", " ").toLowerCase();
  } catch {
    return match.replaceAll("_", " ").toLowerCase();
  }
}

export function selectWikipediaGalleryImages(items: WikipediaMediaItem[], coverImage: string | null, limit = 3) {
  const coverFile = fileNameFromUrl(coverImage);
  const selected = coverImage ? [coverImage] : [];
  const seen = new Set(coverFile ? [coverFile] : []);

  for (const item of items) {
    const title = item.title?.replace(/^File:/, "") ?? "";
    if (item.type !== "image" || item.showInGallery === false || !/\.(?:jpe?g|png|webp)$/i.test(title) || unwantedMedia.test(title)) continue;
    const source = item.srcset?.at(-1)?.src;
    if (!source) continue;
    const key = title.replaceAll("_", " ").toLowerCase();
    if (seen.has(key)) continue;
    selected.push(source.startsWith("//") ? `https:${source}` : source);
    seen.add(key);
    if (selected.length >= limit) break;
  }

  return selected;
}

function addCommonsSearchImages(pages: CommonsSearchPage[], current: string[], limit = 3) {
  const selected = [...current];
  const seen = new Set(current.map(fileNameFromUrl).filter(Boolean));
  for (const page of pages) {
    const title = page.title?.replace(/^File:/, "") ?? "";
    const source = page.imageinfo?.[0]?.thumburl ?? page.imageinfo?.[0]?.url;
    if (!source || !/\.(?:jpe?g|png|webp)$/i.test(title) || unwantedMedia.test(title)) continue;
    const key = title.replaceAll("_", " ").toLowerCase();
    if (seen.has(key)) continue;
    selected.push(source);
    seen.add(key);
    if (selected.length >= limit) break;
  }
  return selected;
}

async function searchCommonsGallery(destination: Destination, current: string[]) {
  const query = `"${destination.name}" India filetype:bitmap`;
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    origin: "*",
    generator: "search",
    gsrsearch: query,
    gsrnamespace: "6",
    gsrlimit: "12",
    prop: "imageinfo",
    iiprop: "url|size",
    iiurlwidth: "1280",
  });
  try {
    const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
      headers: { "User-Agent": "TRAVELY/0.1 destination-gallery" },
      next: { revalidate: 60 * 60 * 24 * 30 },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return current;
    const data = await response.json() as { query?: { pages?: Record<string, CommonsSearchPage> } };
    return addCommonsSearchImages(Object.values(data.query?.pages ?? {}), current, 3);
  } catch {
    return current;
  }
}

export async function addWikipediaGallery(destination: Destination): Promise<Destination> {
  if ((destination.gallery_images?.length ?? 0) >= 3 || !destination.wikipedia_url) return destination;

  let gallery = destination.cover_image_url ? [destination.cover_image_url] : [];
  try {
    const wikipedia = new URL(destination.wikipedia_url);
    const pageTitle = wikipedia.pathname.replace(/^\/wiki\//, "");
    if (pageTitle) {
      const response = await fetch(`https://${wikipedia.hostname}/api/rest_v1/page/media-list/${pageTitle}`, {
        headers: { "User-Agent": "TRAVELY/0.1 destination-gallery" },
        next: { revalidate: 60 * 60 * 24 * 30 },
        signal: AbortSignal.timeout(5000),
      });
      if (response.ok) {
        const data = await response.json() as { items?: WikipediaMediaItem[] };
        gallery = selectWikipediaGalleryImages(data.items ?? [], destination.cover_image_url, 3);
      }
    }
  } catch {
    // A Commons search below can still provide photographs when the article API is unavailable.
  }
  if (gallery.length < 3) gallery = await searchCommonsGallery(destination, gallery);
  return gallery.length > (destination.gallery_images?.length ?? 0) ? { ...destination, cover_image_url: destination.cover_image_url ?? gallery[0] ?? null, gallery_images: gallery } : destination;
}
