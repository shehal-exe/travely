-- India-first destination metadata. Source links keep imported coordinates auditable.
alter table public.destinations
  add column if not exists district text,
  add column if not exists source_name text,
  add column if not exists source_url text,
  add column if not exists verified_at date,
  add column if not exists highlights text[];

create index if not exists destinations_region_idx on public.destinations (region);

comment on column public.destinations.source_url is
  'Original map or public-data record used to verify the destination.';

comment on column public.destinations.verified_at is
  'Date the destination metadata was last reviewed; not a guarantee of live fees or hours.';
