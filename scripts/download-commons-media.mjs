import { readFile, mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const source = JSON.parse(await readFile(path.join(root, "src/data/commons-source-map.json"), "utf8"));
const entries = Object.entries(source);
const credits = {};
const previousCredits = JSON.parse(await readFile(path.join(root, "src/data/commons-credits.json"), "utf8").catch(() => "{}"));
const acceptedLicense = /^(?:CC BY(?:-SA)? (?:2\.0|2\.5|3\.0|4\.0)|CC0|Public domain)$/i;

function plain(value = "") {
  return value.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
}

async function fetchWithRetry(url) {
  let error;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, { headers: { "User-Agent": "TRAVELY-image-curation/1.0 (local travel site)" } });
      if (response.ok) return response;
      error = new Error(`${response.status} for ${url}`);
      if (response.status === 429) await new Promise((resolve) => setTimeout(resolve, 5000 * (attempt + 1)));
    } catch (cause) { error = cause; }
    await new Promise((resolve) => setTimeout(resolve, 750 * (attempt + 1)));
  }
  throw error;
}

for (const [key, title] of entries) {
  if (!/^(destination|category|story|gallery)\/[a-z0-9-]+$/.test(key) || !title.startsWith("File:")) throw new Error(`Unsafe media entry: ${key}`);
}

const pending = [];
for (const [key, title] of entries) {
  const relative = `/images/travel/commons/${key}.jpg`;
  const existing = await stat(path.join(root, "public", relative.slice(1))).catch(() => null);
  if (previousCredits[relative]?.file === title && existing?.size >= 10000) credits[relative] = previousCredits[relative];
  else pending.push([key, title]);
}

const pages = new Map();
for (let i = 0; i < pending.length; i += 30) {
  const api = new URL("https://commons.wikimedia.org/w/api.php");
  api.search = new URLSearchParams({ action: "query", format: "json", prop: "imageinfo", iiprop: "url|extmetadata|size|mime", iiurlwidth: "1280", titles: pending.slice(i, i + 30).map(([, title]) => title).join("|") });
  const metadata = await (await fetchWithRetry(api)).json();
  for (const page of Object.values(metadata.query?.pages ?? {})) pages.set(page.title, page);
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

async function processEntry([key, title]) {
  const page = pages.get(title);
  const info = page?.imageinfo?.[0];
  const license = plain(info?.extmetadata?.LicenseShortName?.value);
  if (!info || info.mime !== "image/jpeg" || !acceptedLicense.test(license)) {
    throw new Error(`${key}: missing photo or unsupported license (${license || "none"}; ${info?.mime || "none"})`);
  }
  if (info.width < 800 || info.height < 450) throw new Error(`${key}: image is too small`);
  const url = info.thumburl ?? info.url;
  const relative = `/images/travel/commons/${key}.jpg`;
  const destination = path.join(root, "public", relative.slice(1));
  const existing = await stat(destination).catch(() => null);
  const needsDownload = !existing || existing.size < 10000 || previousCredits[relative]?.file !== page.title;
  if (needsDownload) {
    const response = await fetchWithRetry(url);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length < 10000 || !response.headers.get("content-type")?.startsWith("image/")) throw new Error(`${key}: invalid image response`);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, bytes);
  }
  credits[relative] = {
    title: plain(info.extmetadata?.ObjectName?.value) || page.title.replace(/^File:/, ""),
    author: plain(info.extmetadata?.Artist?.value) || "Wikimedia Commons contributor",
    license,
    licenseUrl: plain(info.extmetadata?.LicenseUrl?.value),
    source: info.descriptionurl,
    file: page.title,
  };
  process.stdout.write(`${key}: ${needsDownload ? "downloaded" : "verified existing file"} · ${license}\n`);
}

const failures = [];
for (let i = 0; i < pending.length; i += 4) {
  await Promise.all(pending.slice(i, i + 4).map(async (entry) => {
    try { await processEntry(entry); }
    catch (error) { failures.push(`${entry[0]}: ${error.message}`); }
  }));
}
if (failures.length) {
  process.stderr.write(`${failures.join("\n")}\n`);
  process.exitCode = 1;
} else {
  const sorted = Object.fromEntries(Object.entries(credits).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(path.join(root, "src/data/commons-credits.json"), `${JSON.stringify(sorted, null, 2)}\n`);
  process.stdout.write(`Verified and downloaded ${entries.length} photos.\n`);
}
