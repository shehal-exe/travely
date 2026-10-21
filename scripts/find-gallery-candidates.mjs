import sourceMap from "../src/data/commons-source-map.json" with { type: "json" };

const searchTerms = {
  hampi: "Hampi Karnataka stone chariot temple",
  "kaziranga-national-park": "Kaziranga National Park Assam elephant rhino",
  munnar: "Munnar Kerala tea garden landscape",
  varkala: "Varkala Kerala beach cliffs",
  manali: "Manali Himachal Pradesh mountains valley",
  "great-rann-of-kutch": "Great Rann of Kutch white desert Gujarat",
  khajuraho: "Khajuraho temples Madhya Pradesh",
  "konark-sun-temple": "Konark Sun Temple Odisha chariot wheel",
  darjeeling: "Darjeeling",
  gangtok: "Gangtok Sikkim monastery city",
  puducherry: "Puducherry Pondicherry promenade French quarter",
  "swaraj-dweep": "Swaraj Dweep Havelock Radhanagar Beach",
  shillong: "Shillong Meghalaya Umiam lake waterfall",
  kanyakumari: "Kanyakumari Vivekananda Rock sunset",
  delhi: "Delhi Humayun Tomb India Gate",
  mumbai: "Mumbai Marine Drive Gateway of India",
  amritsar: "Amritsar Golden Temple sarovar",
  rishikesh: "Rishikesh Ram Jhula Ganga",
  jodhpur: "Jodhpur Mehrangarh Fort blue city",
  mysuru: "Mysuru Palace Karnataka",
  kolkata: "Kolkata Howrah bridge Victoria memorial",
  hyderabad: "Hyderabad Charminar Golconda fort",
  madurai: "Madurai Meenakshi Amman Temple market",
  "bodh-gaya": "Bodh Gaya Mahabodhi Temple Bihar",
  "ziro-valley": "Ziro Valley Arunachal Pradesh paddy field Apatani",
  kochi: "Kochi Kerala Chinese fishing nets Fort Kochi",
  guwahati: "Guwahati Brahmaputra Kamakhya Temple Assam",
  pelling: "Pelling Sikkim Kanchenjunga Pemayangtse",
};

const start = process.argv[2];
let active = !start;
for (const [slug, term] of Object.entries(searchTerms)) {
  if (slug === start) active = true;
  if (!active) continue;
  const api = new URL("https://commons.wikimedia.org/w/api.php");
  api.search = new URLSearchParams({ action: "query", format: "json", generator: "search", gsrsearch: term, gsrnamespace: "6", gsrlimit: "15", prop: "imageinfo", iiprop: "url|extmetadata|size|mime" });
  let response;
  for (let attempt = 0; attempt < 5; attempt++) {
    response = await fetch(api, { headers: { "User-Agent": "TRAVELY-image-curation/1.0 (local travel site)" } });
    if (response.ok) break;
    if (response.status !== 429) break;
    await new Promise((resolve) => setTimeout(resolve, 12000 * (attempt + 1)));
  }
  if (!response.ok) { process.stderr.write(`${slug}: ${response.status}\n`); continue; }
  const result = await response.json();
  const photos = Object.values(result.query?.pages ?? {}).map((page) => ({ title: page.title, width: page.imageinfo?.[0]?.width, height: page.imageinfo?.[0]?.height, license: page.imageinfo?.[0]?.extmetadata?.LicenseShortName?.value, mime: page.imageinfo?.[0]?.mime }))
    .filter((photo) => photo.mime === "image/jpeg" && photo.width >= 1000 && photo.height >= 600 && /^(?:CC BY(?:-SA)? (?:2\.0|2\.5|3\.0|4\.0)|CC0|Public domain)$/i.test(photo.license ?? "") && photo.title !== sourceMap[`destination/${slug}`]);
  process.stdout.write(`${slug}\n${photos.slice(0, 9).map((photo) => `  ${photo.title} [${photo.license}; ${photo.width}x${photo.height}]`).join("\n")}\n`);
  await new Promise((resolve) => setTimeout(resolve, 2200));
}
