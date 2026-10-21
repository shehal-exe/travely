const search = process.argv.slice(2).join(" ");
if (!search) throw new Error("Pass a Wikimedia Commons image search query.");

const url = new URL("https://commons.wikimedia.org/w/api.php");
url.search = new URLSearchParams({
  action: "query",
  format: "json",
  generator: "search",
  gsrsearch: search,
  gsrnamespace: "6",
  gsrlimit: "8",
  prop: "imageinfo",
  iiprop: "url|extmetadata|size|mime",
  iiurlwidth: "1280",
});
const response = await fetch(url, { headers: { "User-Agent": "TRAVELY-image-curation/1.0 (local travel site)" } });
if (!response.ok) throw new Error(`Wikimedia API returned ${response.status}`);
const data = await response.json();
const matches = Object.values(data.query?.pages ?? {}).map((page) => {
  const image = page.imageinfo?.[0];
  return {
    title: page.title,
    dimensions: image ? `${image.width}x${image.height}` : null,
    license: image?.extmetadata?.LicenseShortName?.value ?? null,
    author: image?.extmetadata?.Artist?.value?.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, 120) ?? null,
    source: image?.descriptionurl ?? null,
    thumb: image?.thumburl ?? null,
    mime: image?.mime ?? null,
  };
});
process.stdout.write(`${JSON.stringify({ search, matches }, null, 2)}\n`);
