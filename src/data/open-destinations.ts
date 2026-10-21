import records from "@/data/open-destinations.json";
import { categories } from "@/data/demo";
import type { Destination } from "@/types/database";

type CategoryKey = keyof typeof categories;

function inferCategory(value: string): CategoryKey {
  if (/(?:beach|coast|island|shore)/i.test(value)) return "beach";
  if (/(?:wildlife|national park|sanctuary|biosphere|nature reserve|zoo)/i.test(value)) return "wildlife";
  if (/(?:hill station)/i.test(value)) return "hill";
  if (/(?:mountain|peak|pass|himalaya|valley|canyon)/i.test(value)) return "mountain";
  if (/(?:market|bazaar|food)/i.test(value)) return "food";
  if (/(?:temple|mosque|church|cathedral|monastery|gurdwara|shrine|stupa|ashram|pilgrimage|religious|sacred)/i.test(value)) return "spiritual";
  if (/(?:lake|waterfall|river|garden|cave|wetland|forest|dam)/i.test(value)) return "nature";
  if (/(?:city|town|municipality|metropolis|village|capital)/i.test(value)) return "city";
  return "heritage";
}

function imageUrl(value: string | null) {
  if (!value) return null;
  return `${value}${value.includes("?") ? "&" : "?"}width=960`;
}

function normalizeRegion(state: string | null, admin: string | null, name: string) {
  if (state === "Daman and Diu" || state === "Dadra and Nagar Haveli district") {
    return "Dadra and Nagar Haveli and Daman and Diu";
  }
  if (state) return state;
  if (/delhi/i.test(`${admin ?? ""} ${name}`)) return "Delhi";
  return "India";
}

function normalizeDistrict(admin: string | null, region: string) {
  if (!admin || admin === region || admin === "India") return null;
  return admin.replace(/\s+district$/i, "");
}

export const openDestinations: Destination[] = records.map((record, index) => {
  const searchable = `${record.name} ${record.description} ${record.types.join(" ")}`;
  const category = categories[inferCategory(searchable)];
  const cover = imageUrl(record.image);
  const region = normalizeRegion(record.state, record.admin, record.name);
  return {
    id: `wikidata-${record.qid}`,
    name: record.name,
    slug: record.slug,
    country: "India",
    region,
    district: normalizeDistrict(record.admin, region),
    description: record.description,
    category_id: category.id,
    category,
    latitude: record.latitude,
    longitude: record.longitude,
    cover_image_url: cover,
    gallery_images: cover ? [cover] : [],
    video_url: null,
    best_time_to_visit: null,
    history: null,
    average_budget: null,
    ideal_duration: null,
    nearest_airport: null,
    getting_around: "Check current public transport, road access, permits, and verified local operators before departure.",
    safety_note: "Confirm seasonal access, opening hours, fees, permits, and official local advisories before booking.",
    opening_hours: null,
    entry_fee: null,
    created_at: "2026-10-20T00:00:00Z",
    source_name: "Wikidata",
    source_url: `https://www.wikidata.org/wiki/${record.qid}`,
    wikipedia_url: record.wikipedia,
    wikidata_id: record.qid,
    verified_at: "2026-10-20",
    highlights: [...record.types.slice(0, 2), record.admin].filter((item): item is string => Boolean(item)),
    review_count: 0,
    media_credit: null,
    data_rank: record.sitelinks || index,
  };
});
