# TRAVELY deployment

TRAVELY is deployed from GitHub to Vercel and uses Supabase as its persistent backend.

## Current endpoints

- Production: <https://travely-henna.vercel.app>
- Repository: <https://github.com/shehal-exe/travely>
- Development branch: `feature/travely-social-network`
- Default branch: `main`

The feature branch must not be merged into or pushed over `main` automatically.

## Vercel environment

Add the following to the Vercel project for Production and any Preview environment that should use Supabase:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED
```

Set `NEXT_PUBLIC_SITE_URL` to the exact HTTPS origin for the deployment. Add `SUPABASE_SERVICE_ROLE_KEY` only if a trusted server-side maintenance workflow genuinely requires it. Normal browser-facing application behavior does not require that key.

## Supabase URL configuration

In Auth URL settings:

1. set the production Site URL to the chosen canonical Vercel origin;
2. allow `https://travely-henna.vercel.app/auth/callback`;
3. add intentional Vercel Preview callback patterns only when preview authentication is needed; and
4. keep local callback URLs for local development.

## Release workflow

1. Confirm the active branch:

   ```bash
   git branch --show-current
   git status
   ```

2. Run the complete checks in [TESTING.md](TESTING.md).
3. Review migrations and apply any new migration to the intended Supabase project.
4. Commit and push only the intended files to `feature/travely-social-network`.
5. Confirm the Vercel build completes successfully.
6. Run the production browser suite or the manual smoke test.
7. Inspect Vercel and Supabase logs for deployment-time or runtime failures.

## What deploys automatically

- A source push can trigger a Vercel build when the Git integration is enabled.
- Vercel installs the locked npm dependencies and runs the Next.js production build.
- Files excluded by `.vercelignore`, including local build caches, test results, and development logs, are not uploaded.

Supabase migrations are not automatically applied by a Vercel frontend deployment. Database changes require their own reviewed migration step.

## Rollback approach

- Use Vercel's retained deployment history to promote a previously working application build.
- Do not use destructive Git resets or force-pushes.
- Database rollback must be handled by a new, carefully reviewed forward migration unless a tested recovery plan explicitly supports another method.
- Restore media or data from the applicable backup rather than overwriting live records ad hoc.

## Post-deployment checklist

- Production URL returns the expected home page.
- No public route exposes an environment secret.
- Auth callbacks return to the production domain.
- Public discovery still works if live story data is temporarily empty.
- Private journal, saves, plans, and administrator routes reject unauthorized access.
- Map tiles, images, and videos load without repeated or broken assets.
- Photo credits and open-data attribution remain reachable.

