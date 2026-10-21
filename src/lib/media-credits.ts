import credits from "@/data/commons-credits.json";

export type MediaCredit = {
  title: string;
  author: string;
  license: string;
  licenseUrl: string;
  source: string;
  file: string;
};

export const commonsCredits = credits as Record<string, MediaCredit>;

export function getMediaCredit(imageUrl: string | null | undefined): MediaCredit | null {
  if (!imageUrl) return null;
  return commonsCredits[imageUrl] ?? null;
}

export function getCommonsFilePage(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  const specialFile = imageUrl.match(/^https:\/\/commons\.wikimedia\.org\/wiki\/Special:FilePath\/([^?]+)/)?.[1];
  const thumbFile = imageUrl.match(/^https:\/\/thumb\.wikimedia\.org\/wikipedia\/(commons|en)\/thumb\/[a-f0-9]\/[a-f0-9]{2}\/([^/]+)\//)?.slice(1);
  const uploadFile = imageUrl.match(/^https:\/\/upload\.wikimedia\.org\/wikipedia\/(commons|en)\/[a-f0-9]\/[a-f0-9]{2}\/([^?]+)/)?.slice(1);
  const repository = (thumbFile?.[0] ?? uploadFile?.[0]) === "en" ? "https://en.wikipedia.org/wiki" : "https://commons.wikimedia.org/wiki";
  const fileName = specialFile ?? thumbFile?.[1] ?? uploadFile?.[1];
  if (!fileName) return null;
  try {
    return `${repository}/File:${encodeURIComponent(decodeURIComponent(fileName)).replaceAll("%20", "_")}`;
  } catch {
    return null;
  }
}
