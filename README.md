# TRAVELY

**Explore. Experience. Remember.**

TRAVELY is a production-oriented travel journal and destination-discovery application built with Next.js, TypeScript, Tailwind CSS, Supabase, Leaflet, React Hook Form, Zod, Framer Motion, and Lucide React.

The app supports public and private travel memories, multi-image uploads, destination discovery, maps, profiles, likes, saves, reporting, personal statistics, and administrator-managed destinations.

## Documentation

- [Technology stack](docs/TECH_STACK.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Features and routes](docs/FEATURES_AND_ROUTES.md)
- [Local setup](docs/SETUP.md)
- [Database and Supabase](docs/DATABASE.md)
- [Data and media sources](docs/DATA_SOURCES.md)
- [Testing and quality](docs/TESTING.md)
- [Deployment](docs/DEPLOYMENT.md)

A plain-text summary is also available in [`TECH_STACK.txt`](TECH_STACK.txt).

## Features

- Responsive landing page with destination and story discovery
- Reduced-motion-aware scroll reveals, parallax hero treatment, and reading-progress indicator
- Hero destination search plus live destination/category filtering
- India-first catalogue with state/union-territory, district, category, and experience search
- Expandable India map that automatically reframes filtered destinations
- Source-linked OpenStreetMap coordinates and destination verification metadata
- Discover → map → journal journey flow inspired by modern travel-planning patterns
- Email/password authentication, verification, password recovery, and optional Google OAuth
- User profiles and public traveler pages
- Public and private travel memories
- Create, edit, and delete workflows with ownership enforcement
- Up to eight images per memory with type and size validation
- Community search, rating filters, and sorting
- Likes, saved stories, and content reporting
- Leaflet/OpenStreetMap destination and travel maps
- Personal dashboard with database-derived statistics
- Role-protected administrator dashboard and destination management
- Supabase PostgreSQL migration, indexes, RLS policies, private Storage bucket, and repeatable seed data
- Vitest unit tests and Playwright browser tests

When Supabase is not configured, public marketing pages show a small set of clearly labelled demonstration records. Account and write operations remain disabled rather than silently using a mock backend.

## Requirements

- Node.js 24 LTS
- npm 11+
- A Supabase project
- A Vercel account for deployment

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and provide the required values:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=false
   ```

   `SUPABASE_SERVICE_ROLE_KEY` is documented for trusted maintenance scripts only. The application does not expose or require it in browser code.

3. Apply every SQL file in `supabase/migrations/` in filename order, then run `supabase/seed.sql` when starter destinations are required. The exact migration list is maintained in [docs/DATABASE.md](docs/DATABASE.md).

4. In Supabase Authentication settings:

   - Set the Site URL to `http://localhost:3000` during local development.
   - Add `http://localhost:3000/auth/callback` as an allowed redirect URL.
   - Enable email verification as desired.
   - To enable Google login, configure the Google provider and set `NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=true`.

5. Start the application:

   ```bash
   npm run dev
   ```

6. Open `http://localhost:3000`.

## Creating the first administrator

Register normally, then assign the role in the Supabase SQL editor using the authenticated user's UUID:

```sql
insert into public.user_roles (user_id, role)
values ('USER_UUID_HERE', 'admin')
on conflict do nothing;
```

The `/admin` route checks this role server-side, and RLS independently enforces administrator permissions in PostgreSQL.

## Database and privacy model

- Every authenticated account receives a `profiles` row and a default `member` role through a database trigger.
- Public memories can be read by visitors.
- Private memories can be read only by their owner or an administrator.
- Mutations require ownership or an administrator role.
- Duplicate likes, saves, and reports are prevented with composite unique constraints.
- Photographs are stored in a private `memory-images` bucket.
- Storage policies follow memory visibility and ownership.
- Public and owner-authorized image URLs are generated server-side with short-lived signed URLs.
- Destination fees, opening hours, and seasonal guidance remain empty until an administrator verifies them.
- Imported destination coordinates retain a public source link and review date.

## India destination data

The repository contains 37 curated India destination records and 475 Wikidata-derived open records. Runtime assembly deduplicates them by place name and supplements live Supabase records without replacing existing database entries. The catalogue spans heritage, spiritual, mountain, wildlife, beach, nature, city, food, and hill-station categories. Coordinates are source-linked; descriptions and highlights are concise TRAVELY editorial summaries.

The architecture is ready to grow state by state. A production ingestion job should normalize OpenStreetMap/Overpass points of interest, enrich selected records with Wikidata and properly attributed Wikimedia Commons media, and then store reviewed records in Supabase. Do not query the public Nominatim service as browser autocomplete or bulk-download all Indian POIs: its public usage policy requires identified, rate-limited, cacheable user-triggered requests. Opening hours and fees should remain administrator-verified fields because they change frequently.

Open-data attribution must stay visible wherever the data or map is displayed:

- OpenStreetMap: <https://www.openstreetmap.org/copyright>
- Wikidata: <https://www.wikidata.org/wiki/Wikidata:Licensing>
- Wikimedia Commons: follow the license and creator credit attached to each media file

## Verification commands

```bash
npm run typecheck
npm test
npm run lint
npm run build
```

Browser tests require Playwright's Chromium binary:

```bash
npx playwright install chromium
npm run test:e2e
```

## Deploying to Vercel

1. Push this project to a Git repository.
2. Import the repository into Vercel.
3. Add the environment variables from `.env.example` in Vercel project settings.
4. Change `NEXT_PUBLIC_SITE_URL` to the production HTTPS URL.
5. Add the production `/auth/callback` URL to Supabase's redirect allow-list.
6. Deploy. Vercel detects the Next.js application automatically.
7. Run the production deployment and verify registration, email callbacks, private-memory access, uploads, and administrator authorization.

## Project structure

```text
src/
  actions/          Server Actions for auth, memories, profiles, and admin
  app/              App Router pages and callback handler
  components/       UI, layout, cards, maps, forms, and feature components
  data/             Clearly labelled preview records
  lib/              Supabase clients, queries, validation, and utilities
  types/            Shared application types
supabase/
  migrations/       PostgreSQL schema, indexes, RLS, triggers, and Storage policies
  seed.sql           Repeatable administrator-managed sample destinations
tests/e2e/           Playwright navigation and responsive tests
```

## Configuration limitations

- A live Supabase project and credentials are required to verify hosted authentication, database writes, RLS, and Storage end to end.
- Google OAuth remains hidden until its provider is configured.
- Playwright browsers are not downloaded by `npm install`; install Chromium explicitly before running browser tests.
- Legal summaries are implementation placeholders and must be replaced with reviewed policies before a public launch.
