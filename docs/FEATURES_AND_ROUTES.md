# TRAVELY features and routes

## Core product areas

### Discover India

- Curated and open-data destination catalogue with search and travel-style filters.
- Destination pages with description, history, budget guidance, ideal duration, airport, transport, safety notes, highlights, media, map coordinates, and source links when available.
- Nine travel categories: Beaches, Mountains, Heritage, Food & Markets, Spiritual, Nature, Hill Stations, Wildlife, and Cities.
- Interactive OpenStreetMap view with destination pins and filter-aware reframing.
- Four ready-made travel circuits with stop sequence, duration, budget range, best season, route map, and destination imagery.

### Community stories

- Public story discovery and a feed from followed travellers.
- Search, minimum-rating, duration, sorting, and pagination controls.
- Story cards with author, trip duration, expense, rating, style, likes, and imagery.
- Full story pages with multi-image galleries, captions, tips, comments, saves, likes, reporting, and plan-from-story actions.
- Public profiles, follower/following lists, follow controls, and profile statistics.

### Journal and planning

- Public or private memories with up to eight images.
- Create, edit, and delete flows protected by ownership checks and RLS.
- Private trip plans with dates, stops, budget, notes, packing list, and expense breakdown.
- Stop-order suggestions and distance calculations.
- Saved stories and personal journey statistics.

### Administration

- Role-protected administrator portal.
- Searchable member list and administrator-role management.
- Destination creation and deletion.
- Report review and status management.
- Server-side route protection plus database policy enforcement.

## Route reference

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Animated landing page, destination film, search, feature path, and route inspiration |
| `/destinations` | Public | Destination catalogue, map view, and ready-made circuits; supports `q`, `category`, and `view` query parameters |
| `/destinations/[slug]` | Public | Destination detail, walkthrough gallery, video, planning information, map, and related stories |
| `/categories` | Public | Travel-style/category walkthrough |
| `/routes/[slug]` | Public | Ready-made circuit detail and route map |
| `/explore` | Public; following feed requires sign-in | Community travel-blog feed with search, filters, sorting, and pagination |
| `/memories/[id]` | Public or owner/admin according to visibility | Complete travel story with media and social interactions |
| `/gallery` | Public | Community photo gallery and uploader attribution |
| `/profile/[username]` | Public | Traveller profile and public memories |
| `/profile/[username]/connections` | Public | Paginated follower or following list |
| `/about` | Public | About, platform values, contact information, and destination film |
| `/photo-credits` | Public | Image creators, licences, and source links |
| `/privacy` | Public | Privacy summary |
| `/terms` | Public | Terms summary |
| `/auth/sign-up` | Guest | Account registration |
| `/auth/login` | Guest | Email/password and optional Google login |
| `/auth/forgot-password` | Guest | Password-reset request |
| `/auth/update-password` | Recovery session | Choose a replacement password |
| `/auth/callback` | Auth callback | Completes OAuth or email-link authentication |
| `/journal` | Member | Personal journal dashboard and statistics |
| `/journal/new` | Member | Create a memory |
| `/journal/[id]/edit` | Owner | Edit a memory |
| `/saved` | Member | Saved public stories |
| `/plan` | Member | Create, edit, save, and delete private itineraries |
| `/settings` | Member | Profile settings |
| `/admin` | Administrator | Users, roles, destinations, and reports |

## Query parameters

### Destinations

- `q`: place, region, district, or interest search.
- `category`: category slug or `all`.
- `view`: `places`, `map`, or `routes`.

### Community stories

- `feed`: `discover` or `following`.
- `page`: positive page number, capped by the server.
- `search`: destination search text.
- `rating`: `4` or `5` for a minimum rating.
- `duration`: `short`, `long`, or the default `all`.
- `sort`: `newest`, `rating`, or `budget`.

### Planner

- `trip`: open an existing saved trip.
- `destination`: start a plan from one destination.
- `circuit`: start a plan from a ready-made circuit.
- `story`: start a plan inspired by a public or owned travel story.

## Graceful fallback behavior

If Supabase is not configured, public destination and demonstration story pages remain available. Account creation, sign-in, private data, social mutations, saved plans, and administration require a working Supabase connection and do not silently use a fake database.

