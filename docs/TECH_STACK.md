# TRAVELY technology stack

Last reviewed: 25 October 2026

This document describes the stack currently declared in `package.json` and used by the application. Version ranges beginning with `^` may resolve to newer compatible releases when the lockfile is updated; `package-lock.json` is the installation source of truth.

## Application platform

| Layer | Technology | Declared version | Purpose |
| --- | --- | ---: | --- |
| Web framework | Next.js App Router | `^16.4.3` | Server-rendered routes, layouts, metadata, Server Actions, and production builds |
| UI runtime | React / React DOM | `19.3.0` | Component rendering and client interactions |
| Language | TypeScript | `^5` | Strict static typing across the application |
| Styling | Tailwind CSS | `^4` | Utility-first responsive styling through the Turbopack CSS integration |
| Animation | Framer Motion | `^14.2.0` | Scroll reveals, transitions, and reduced-motion-aware animation |
| Icons | Lucide React | `^1.56.0` | Accessible interface icons |

## Data, identity, and forms

| Layer | Technology | Declared version | Purpose |
| --- | --- | ---: | --- |
| Hosted backend | Supabase | Managed service | PostgreSQL, authentication, Storage, and Row Level Security |
| Browser/server client | `@supabase/supabase-js` | `^2.117.3` | Typed access to Auth, PostgREST, and Storage |
| Next.js session integration | `@supabase/ssr` | `^0.12.7` | Cookie-aware server and browser Supabase clients |
| Forms | React Hook Form | `^7.90.0` | Client-side form state and validation flow |
| Schema validation | Zod | `^4.6.7` | Runtime validation for memories, social actions, and trip plans |
| Form adapters | Hookform Resolvers | `^5.9.1` | Zod integration for React Hook Form |
| Dates | date-fns | `^4.4.0` | Date formatting and trip calculations |

## Maps and interface utilities

| Technology | Declared version | Purpose |
| --- | ---: | --- |
| Leaflet | `^1.9.4` | Interactive geographic maps |
| React Leaflet | `^5.0.0` | React components for Leaflet maps |
| OpenStreetMap tiles and coordinates | External open data | Map display and source-linked destination coordinates |
| Sonner | `^2.0.8` | Toast notifications |
| Class Variance Authority | `^0.7.1` | Reusable component variants |
| clsx | `^2.1.1` | Conditional class composition |
| tailwind-merge | `^3.7.0` | Conflict-safe Tailwind class merging |

## Testing and quality

| Tool | Declared version | Purpose |
| --- | ---: | --- |
| Vitest | `^5.0.4` | Unit tests for validation, data, media, and trip-planning utilities |
| Playwright | `^1.64.0` | Desktop and mobile end-to-end browser tests |
| ESLint | `^9` | Static code-quality checks |
| `eslint-config-next` | `^16.4.3` | Next.js-specific lint rules |
| TypeScript compiler | `^5` | `tsc --noEmit` type verification |

## Infrastructure

- **Source control:** Git and GitHub (`shehal-exe/travely`).
- **Development branch:** `feature/travely-social-network`.
- **Hosting:** Vercel.
- **Production URL:** <https://travely-henna.vercel.app>
- **Database region:** Supabase project in `ap-south-1`.
- **Media:** Local optimized assets, Wikimedia Commons media with source metadata, and private Supabase Storage uploads.

## Runtime configuration

The application reads these environment variables:

| Variable | Exposure | Required | Description |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser and server | Yes for live accounts/data | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser and server | Yes for live accounts/data | Public anon/publishable key; RLS remains the authorization boundary |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Maintenance scripts only | Privileged key; never expose it to browser code or commit it |
| `NEXT_PUBLIC_SITE_URL` | Browser and server | Yes | Canonical application URL used by authentication redirects |
| `NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED` | Browser and server | No | Shows Google sign-in only when the provider is configured |

Do not commit `.env.local`. Use `.env.example` as the safe template.

