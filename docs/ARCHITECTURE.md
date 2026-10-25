# TRAVELY architecture

TRAVELY is a Next.js App Router application. Public discovery content is server-rendered, interactive maps and planners run as focused client components, and persistent user data is stored in Supabase.

## System overview

```text
Visitor or member
       |
       v
Vercel / Next.js App Router
  |-- Server Components: pages, metadata, initial data loading
  |-- Client Components: maps, filters, forms, planner, animation
  |-- Server Actions: authenticated mutations and validation
       |
       +------------------------+
       |                        |
       v                        v
Local/open catalogue       Supabase
  |-- 37 curated records     |-- Auth
  |-- 475 Wikidata records   |-- PostgreSQL + RLS
  |-- circuits/categories    |-- Private image Storage
  |-- credited media         |-- PostgREST/RPC
       |
       v
Leaflet + OpenStreetMap maps
```

The local and open catalogues keep public discovery useful even when Supabase is unavailable. Account, private-journal, social-write, planner-save, and administrative operations require the live backend.

## Main directories

| Path | Responsibility |
| --- | --- |
| `src/app/` | App Router pages, layouts, route handlers, loading UI, and global styles |
| `src/actions/` | Server Actions for authentication, memories, profiles, social features, trips, and administration |
| `src/components/` | Reusable UI, layout, maps, media, motion, destination, journal, and planner components |
| `src/data/` | Curated destinations, open destination dataset, category guides, circuits, demo stories, and media attribution |
| `src/lib/` | Data access, Supabase clients, validation, social queries, trip logic, Wikipedia gallery enrichment, and utilities |
| `src/types/` | Shared TypeScript domain types |
| `supabase/migrations/` | Versioned PostgreSQL schema, policies, functions, indexes, and Storage configuration |
| `supabase/seed.sql` | Repeatable destination seed data |
| `scripts/` | Data-import, media, and local-launch helpers |
| `tests/e2e/` | Playwright desktop and mobile browser checks |
| `public/` | Local images, destination films, and other static assets |

## Request and data flow

### Public discovery

1. A Server Component requests destination or story data.
2. `src/lib/data.ts` tries the configured Supabase backend.
3. Live destination rows are enriched with curated local planning content when appropriate.
4. Missing catalogue entries are filled by curated and Wikidata-derived local records.
5. The page renders server-side; filters and maps become interactive in client components.

### Authenticated mutation

1. A form or control calls a Server Action in `src/actions/`.
2. Zod or explicit constraints validate the incoming values.
3. The server Supabase client resolves the signed-in user from cookies.
4. The action writes through the Data API or Storage.
5. PostgreSQL Row Level Security independently checks ownership or administrator status.
6. The action revalidates affected routes and returns a safe result.

### Images

- Destination and editorial media is served from `public/` or approved remote Wikimedia/Supabase hosts.
- User memory uploads go to the private `memory-images` bucket.
- The application generates short-lived signed URLs only for viewers permitted by the database policies.
- Media source records live in `src/data/commons-credits.json` and `src/data/commons-source-map.json`.

## Server and client boundaries

- Pages default to Server Components for fast initial rendering and secure data loading.
- Leaflet maps are client-only because they depend on browser APIs.
- Filters, trip planning, toasts, media playback, and animation use client components only where interaction requires them.
- Secrets are never referenced from client components. Only variables prefixed with `NEXT_PUBLIC_` are intentionally browser-visible.

## Resilience and progressive behavior

- Public discovery has local fallback data instead of presenting an empty product.
- Database-dependent features surface useful errors and preserve public navigation.
- Hero videos use poster images and continuous playlist behavior where configured.
- Motion respects the visitor's reduced-motion preference.
- Maps provide explicit interaction controls to reduce accidental zooming on mouse and touchpad input.

## Authorization model

Application route checks improve navigation and error handling, but PostgreSQL RLS is the security boundary. Members can manage their own profiles, private trips, memories, saves, likes, follows, and comments. Administrators receive explicit role-based access to user roles, destinations, categories, and reports.

