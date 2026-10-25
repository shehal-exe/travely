# TRAVELY testing and quality checks

## Standard verification

Run these commands from the project root:

```bash
npm run typecheck
npm test
npm run lint
npm run build
```

| Command | What it checks |
| --- | --- |
| `npm run typecheck` | Strict TypeScript correctness without emitting build files |
| `npm test` | Vitest unit tests under `src/**/*.test.ts` |
| `npm run lint` | ESLint and Next.js code-quality rules |
| `npm run build` | Production Next.js compilation, route generation, and bundling |

## Unit-test coverage areas

- Memory form validation and upload constraints.
- Social-action validation.
- Trip dates, packing lists, stop ordering, and distance calculations.
- Wikipedia gallery normalization.
- Destination and media integrity, including duplicate-image safeguards.

## Browser tests

Playwright specifications live in `tests/e2e/`:

- `navigation.spec.ts`: core routes, navigation, responsive menus, and destination views.
- `site-health.spec.ts`: runtime errors, broken media, page health, and continuous destination-film playback.
- `social-discovery.spec.ts`: public social discovery and related states.

The suite runs against desktop Chrome and a Pixel 7 viewport:

```bash
npx playwright install chromium
npm run test:e2e
```

To test the production deployment instead of starting a local server:

```powershell
$env:PLAYWRIGHT_BASE_URL='https://travely-henna.vercel.app'
npm run test:e2e
```

## Manual release smoke test

Before treating a release as complete, check:

1. home video playback, playlist continuity, poster fallback, and reduced-motion behavior;
2. destination place, map, and route tabs with mouse, touchpad, keyboard, and mobile viewport;
3. unique destination/category/story imagery and visible media credits;
4. sign-up, login, logout, password recovery, and callback redirects;
5. public/private memory access using two different accounts;
6. image upload, signed image display, edit, and delete;
7. likes, saves, follows, comments, and reports;
8. trip creation, reordering, expense calculation, reload, and deletion;
9. administrator user search, role changes, destination management, and report status changes; and
10. browser console, Vercel logs, and Supabase Auth/API/database logs for new errors.

## Security and dependency checks

```bash
npm audit
```

After schema or policy changes, run Supabase security and performance advisors and test access with anonymous, member, owner, second-member, and administrator sessions. A successful UI action is not enough to prove RLS correctness.

## Current verification baseline

The latest documented baseline on 25 October 2026 is:

- typecheck: passed;
- unit tests: 24 passed;
- lint: passed;
- production build: passed;
- applicable browser checks: 25 passed across desktop/mobile runs, with one intentionally skipped Chromium-specific case; and
- npm audit: zero known vulnerabilities.

Run the commands again after any code, dependency, content, environment, or database change; this baseline is not a substitute for current verification.

