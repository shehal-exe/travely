# TRAVELY data and media sources

TRAVELY combines reviewed local editorial records, open destination data, open map data, and user-contributed stories. The UI avoids presenting planning estimates as guaranteed facts.

## Destination catalogue

The repository currently contains:

- **37 curated India destination records** with editorial summaries, budgets, suggested durations, access notes, highlights, and selected media.
- **475 Wikidata-derived records** in `src/data/open-destinations.json`.
- **Nine travel categories** in `src/data/category-guides.ts`.
- **Four ready-made circuits** in `src/data/circuits.ts`.

Curated and open records are deduplicated by name when assembled for the public catalogue. When Supabase is available, live database records are loaded first and supplemented by local records that are not already present.

## Open-data provenance

| Source | Used for | Licence/attribution location |
| --- | --- | --- |
| OpenStreetMap | Map tiles, coordinates, and coordinate source links | <https://www.openstreetmap.org/copyright> |
| Wikidata | Place names, types, administrative location, coordinates, rank, identifiers, and article links | <https://www.wikidata.org/wiki/Wikidata:Licensing> |
| Wikimedia Commons | Destination, category, gallery, and story photography | The licence and creator attached to each file page |
| Wikipedia | Optional destination gallery enrichment and background reading links | Individual article/source terms apply |
| geoBoundaries | India ADM0 coastline and ADM1 state/union-territory geography used by destination and circuit maps | <https://www.geoboundaries.org/>; ADM0 is CC0 1.0 and ADM1 is CC BY 2.5 IN, sourced from DataMeet India community and Election Commission of India |
| Esri World Imagery | Live satellite and aerial imagery clipped to the India boundary in destination and circuit maps | <https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9>; imagery © Esri and listed providers |

Media attribution records are stored in:

- `src/data/commons-credits.json`
- `src/data/commons-source-map.json`
- the public `/photo-credits` page

## What is verified and what is guidance

- Coordinates and source identifiers are traceable to their linked open-data record.
- Curated descriptions are short TRAVELY editorial summaries rather than copied articles.
- Budget, duration, season, transport, and safety fields are planning guidance and can change.
- Fees, opening hours, permits, weather, and local restrictions must be checked against current official sources before travel.
- Community stories are user-contributed experiences, not official travel advice.

## Refresh workflow

The scripts in `scripts/` support controlled updates:

- `import-wikidata.mjs`: destination-record import and normalization.
- `commons-candidates.mjs`: media candidate discovery.
- `find-gallery-candidates.mjs`: destination gallery research.
- `download-commons-media.mjs`: local media download with attribution data.

Before publishing a refresh:

1. inspect source licences and creator credits;
2. deduplicate destinations and media;
3. verify coordinates and administrative regions;
4. keep changing planning values clearly labelled;
5. run the media unit tests and browser checks; and
6. update the visible photo-credit records.

Public Nominatim must not be used as bulk import infrastructure or unthrottled browser autocomplete. Any future live geocoding integration should follow its usage policy, identify the application, rate-limit requests, and cache suitable responses.

