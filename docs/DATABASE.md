# TRAVELY database and Supabase

TRAVELY uses Supabase for PostgreSQL, authentication, and private image Storage. The migration files in `supabase/migrations/` are the authoritative schema history.

## Data model

| Table | Purpose | Main access rule |
| --- | --- | --- |
| `profiles` | Public traveller identity, bio, location, and avatar | Publicly readable; owner updates |
| `destination_categories` | Administrator-managed destination categories | Publicly readable; admin writes |
| `destinations` | Curated destination records and planning metadata | Publicly readable; admin writes |
| `travel_memories` | Public or private travel stories | Public stories, owner records, or admin review |
| `memory_images` | Ordered image metadata for a story | Follows memory visibility and ownership |
| `memory_likes` | Unique member/story likes | Public counts; member owns mutation |
| `saved_memories` | A member's saved-story list | Owner only |
| `content_reports` | Member reports and moderation state | Reporter and administrators |
| `user_roles` | `member` and `admin` assignments | Owner may read own role; admin manages roles |
| `trip_plans` | Private itinerary, stops, packing, and expense JSON | Owner only |
| `traveller_follows` | Public follower/following graph | Publicly readable; follower owns mutation |
| `memory_comments` | Comments on public travel stories | Publicly readable; author creates/deletes |

## Storage

The `memory-images` bucket is private.

- Maximum file size: 8 MiB per image.
- Allowed MIME types: JPEG, PNG, WebP, and AVIF.
- Each upload is stored below the authenticated user's folder.
- Upload replacement requires the applicable insert, select, and update policies.
- Owners and authorized viewers receive time-limited signed URLs from server-side code.
- A memory supports positions `0` through `7`, for a maximum of eight images.

## Authentication and roles

Email/password authentication is supported. Google OAuth is shown only when its environment flag is enabled and the provider is configured.

On account creation, the `handle_new_user` trigger creates:

1. a matching `profiles` row; and
2. a default `member` entry in `user_roles`.

Administrator access is not inferred from editable user metadata. It is granted through `user_roles` and checked by protected database helpers and RLS policies.

## Row Level Security

RLS is enabled on every application table in the exposed `public` schema. Important guarantees include:

- Private memories are visible only to their owner or an administrator.
- Updates use ownership conditions; sensitive update policies include both visibility and write checks.
- Trip plans and saved memories are owner-only.
- Users cannot follow as another account or comment as another author.
- Comments are accepted only for public memories.
- Administrative writes require a database-verified administrator role.
- Privileged helpers are moved or constrained so public execution is not the authorization mechanism.

Application checks are for user experience only. RLS remains the final authorization boundary.

## Migration order

Apply every migration in filename order:

1. `202610130001_initial_schema.sql`
2. `202610200001_india_destination_metadata.sql`
3. `202610200002_security_hardening.sql`
4. `202610200003_memory_story_details.sql`
5. `202610200004_rls_performance.sql`
6. `202610210001_admin_portal.sql`
7. `202610210002_private_admin_helpers.sql`
8. `202610220001_trip_plans.sql`
9. `20261022035015_social_network.sql`

Then run `supabase/seed.sql` if the curated starter destination rows are required.

Do not edit an already-applied migration. Create a new migration for future schema changes, test it, run Supabase database advisors, and commit the migration with the application change.

## Security rules for contributors

- Never expose or commit the service-role/secret key.
- Public clients may use only the anon/publishable key, with RLS enabled.
- Never use user-editable metadata for authorization.
- Do not add `SECURITY DEFINER` merely to bypass a permission error.
- Keep privileged functions out of exposed schemas when practical, revoke default public execution, and perform explicit identity checks.
- Remember that deleting a user does not automatically invalidate already-issued access tokens.
- Review Auth, database, API, and Storage logs after changing access control.

## Administrator creation

After the account exists, an existing trusted administrator can grant access through the TRAVELY admin portal. For first-time bootstrap, use a controlled database operation with the authenticated user's UUID:

```sql
insert into public.user_roles (user_id, role)
values ('USER_UUID_HERE', 'admin')
on conflict do nothing;
```

Do not use an email address as the database role identifier, and do not run this from browser code.

