# TRAVELY local setup

## Prerequisites

- Node.js 24 LTS
- npm 11 or later
- Git
- A Supabase project for authentication and persistent user features

## 1. Get the source

```bash
git clone https://github.com/shehal-exe/travely.git
cd travely
git switch feature/travely-social-network
```

All social-network development belongs on `feature/travely-social-network`. Do not push feature work directly to `main`.

## 2. Install dependencies

```bash
npm install
```

The committed `package-lock.json` should remain in source control.

## 3. Configure environment variables

Copy `.env.example` to `.env.local` and replace placeholders:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-or-publishable-key
SUPABASE_SERVICE_ROLE_KEY=server-only-maintenance-key-if-needed
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=false
```

`SUPABASE_SERVICE_ROLE_KEY` is optional for the web application and must never be exposed through `NEXT_PUBLIC_`, committed, logged, or sent to a browser.

## 4. Prepare Supabase

Apply every SQL migration in `supabase/migrations/` in filename order, then run `supabase/seed.sql` when starter destinations are needed. See [DATABASE.md](DATABASE.md) for the exact order and security model.

In Supabase Auth URL settings:

- set the local Site URL to `http://localhost:3000`;
- allow `http://localhost:3000/auth/callback`; and
- add the corresponding production callback before deployment.

Configure Google as an Auth provider before changing `NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED` to `true`.

## 5. Start development

```bash
npm run dev
```

Open <http://localhost:3000>.

On this Windows workspace, `START-TRAVELY.cmd` is also available as a convenience launcher. Keep its terminal window open while using the local site.

## 6. Verify the installation

```bash
npm run typecheck
npm test
npm run lint
npm run build
```

For browser tests, install a compatible Chromium browser once if required, then run:

```bash
npx playwright install chromium
npm run test:e2e
```

## Common setup problems

### `localhost` refuses the connection

The development server is not running, exited with an error, or was started from the wrong directory. Run `npm run dev` from the folder containing `package.json` and keep that terminal open.

### `ENOENT ... package.json`

The terminal is in the wrong folder. Change to the TRAVELY project directory before running npm commands.

### Authentication redirects to the wrong address

Check `NEXT_PUBLIC_SITE_URL` and the Supabase Site URL/redirect allow-list. Local and production callback URLs must both be explicitly allowed.

### Public pages work but accounts do not

Public catalogue fallback is expected to work without Supabase. Verify the project URL and public key, confirm the migrations are applied, and inspect Auth/API logs for account operations.

### Maps appear blank

Check network access to the map tile provider, browser console errors, container sizing, and client-side hydration. Leaflet maps require browser APIs and a visible element height.

