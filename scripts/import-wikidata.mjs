import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const catalogueQuery = `
SELECT DISTINCT ?place ?placeLabel ?placeDescription ?coord ?image ?adminLabel ?article ?instanceLabel ?sitelinks WHERE {
  ?place wdt:P17 wd:Q668;
         wdt:P625 ?coord;
         wikibase:sitelinks ?sitelinks.
  FILTER(?sitelinks >= 8)
  OPTIONAL { ?place wdt:P18 ?image. }
  OPTIONAL { ?place wdt:P131 ?admin. }
  OPTIONAL { ?place wdt:P31 ?instance. }
  OPTIONAL {
    ?article schema:about ?place;
             schema:isPartOf <https://en.wikipedia.org/>.
  }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY DESC(?sitelinks)
LIMIT 1800
`;

const endpointBases = [
  "https://query.wikidata.org/sparql?format=json&query=",
  "https://qlever.dev/api/wikidata?format=json&query=",
];

const travelTerms = /(?:archaeological|ashram|bazaar|beach|biosphere|canyon|castle|cathedral|cave|city|coast|dam|fort|garden|gateway|ghat|gurdwara|heritage|hill|island|lake|mausoleum|memorial|monastery|monument|mosque|mountain|museum|national park|nature reserve|palace|park|peak|pilgrimage|river|ruin|sanctuary|shrine|stepwell|stupa|temple|tomb|tourist attraction|town|valley|village|waterfall|wetland|wildlife|zoo)/i;

function parsePoint(value) {
  const match = value?.match(/Point\(([-\d.]+) ([-\d.]+)\)/);
  return match ? { longitude: Number(match[1]), latitude: Number(match[2]) } : null;
}

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function fetchRows(query) {
  let lastError;
  for (const endpointBase of endpointBases) {
    try {
      const endpoint = `${endpointBase}${encodeURIComponent(query)}`;
      const response = await fetch(endpoint, {
        headers: {
          Accept: "application/sparql-results+json",
          "User-Agent": "TRAVELY/0.1 open-data catalogue importer",
        },
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const body = await response.json();
      return body.results.bindings;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

async function fetchStates(qids) {
  const regionRows = await fetchRows(`
SELECT DISTINCT ?state ?stateLabel WHERE {
  wd:Q668 wdt:P150 ?state.
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}`);
  const regionLabels = new Map(
    regionRows.map((row) => [row.state?.value?.split("/").pop(), row.stateLabel?.value]).filter(([qid, label]) => qid && label),
  );
  const parentByQid = new Map();
  const visited = new Set();
  let frontier = [...new Set(qids)];

  for (let depth = 0; depth < 7 && frontier.length; depth += 1) {
    const next = new Set();

    for (let index = 0; index < frontier.length; index += 50) {
      const chunk = frontier.slice(index, index + 50);
      const query = `
SELECT DISTINCT ?place ?parent WHERE {
  VALUES ?place { ${chunk.map((qid) => `wd:${qid}`).join(" ")} }
  ?place wdt:P131 ?parent.
}`;

      const rows = await fetchRows(query);
      for (const row of rows) {
        const qid = row.place?.value?.split("/").pop();
        const parent = row.parent?.value?.split("/").pop();
        if (!qid || !parent) continue;
        const parents = parentByQid.get(qid) ?? new Set();
        parents.add(parent);
        parentByQid.set(qid, parents);
        if (!visited.has(parent) && !regionLabels.has(parent)) next.add(parent);
      }
    }

    frontier.forEach((qid) => visited.add(qid));
    frontier = [...next];
  }

  const states = new Map();
  for (const qid of qids) {
    const queue = [qid];
    const checked = new Set();
    while (queue.length) {
      const current = queue.shift();
      if (!current || checked.has(current)) continue;
      checked.add(current);
      if (regionLabels.has(current)) {
        states.set(qid, regionLabels.get(current));
        break;
      }
      for (const parent of parentByQid.get(current) ?? []) queue.push(parent);
    }
  }

  return states;
}

const rows = await fetchRows(catalogueQuery);
const grouped = new Map();

for (const row of rows) {
  const qid = row.place?.value?.split("/").pop();
  const point = parsePoint(row.coord?.value);
  const name = row.placeLabel?.value;
  if (!qid || !point || !name || name === qid) continue;

  const current = grouped.get(qid) ?? {
    qid,
    name,
    description: row.placeDescription?.value ?? "",
    ...point,
    image: row.image?.value ?? null,
    admin: row.adminLabel?.value ?? null,
    state: null,
    wikipedia: row.article?.value ?? null,
    sitelinks: Number(row.sitelinks?.value ?? 0),
    types: new Set(),
  };

  if (!current.image && row.image?.value) current.image = row.image.value;
  if (!current.admin && row.adminLabel?.value) current.admin = row.adminLabel.value;
  if (!current.wikipedia && row.article?.value) current.wikipedia = row.article.value;
  if (!current.description && row.placeDescription?.value) current.description = row.placeDescription.value;
  if (row.instanceLabel?.value) current.types.add(row.instanceLabel.value);
  grouped.set(qid, current);
}

const candidates = [...grouped.values()]
  .filter((item) => travelTerms.test(`${item.name} ${item.description} ${[...item.types].join(" ")}`));
const stateByQid = await fetchStates(candidates.map((item) => item.qid));

const records = candidates
  .map((item) => ({
    qid: item.qid,
    name: item.name,
    slug: `${slugify(item.name)}-${item.qid.toLowerCase()}`,
    description: item.description || `${item.name} is a notable Indian destination documented by Wikidata.`,
    latitude: item.latitude,
    longitude: item.longitude,
    image: item.image ? item.image.replace(/^http:/, "https:") : null,
    admin: item.admin,
    state: stateByQid.get(item.qid) ?? null,
    wikipedia: item.wikipedia,
    types: [...item.types].sort(),
    sitelinks: item.sitelinks,
  }))
  .sort((a, b) => b.sitelinks - a.sitelinks || a.name.localeCompare(b.name));

const outputPath = resolve("src/data/open-destinations.json");
await writeFile(outputPath, `${JSON.stringify(records, null, 2)}\n`, "utf8");
console.log(`Saved ${records.length} travel-relevant Wikidata records to ${outputPath}`);
