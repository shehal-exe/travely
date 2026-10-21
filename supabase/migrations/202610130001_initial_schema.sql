create extension if not exists pgcrypto;

create type public.memory_visibility as enum ('public', 'private');
create type public.report_status as enum ('open', 'reviewing', 'resolved', 'dismissed');
create type public.app_role as enum ('admin', 'member');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_-]{3,30}$'),
  display_name text not null check (char_length(display_name) between 2 and 80),
  avatar_url text,
  bio text check (char_length(bio) <= 500),
  location text check (char_length(location) <= 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.destination_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$')
);

create table public.destinations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  country text not null,
  region text,
  description text not null,
  category_id uuid references public.destination_categories(id) on delete set null,
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  cover_image_url text,
  best_time_to_visit text,
  opening_hours text,
  entry_fee text,
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.travel_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  destination_id uuid references public.destinations(id) on delete set null,
  title text not null check (char_length(title) between 3 and 120),
  destination_name text not null check (char_length(destination_name) between 2 and 120),
  location_visited text not null check (char_length(location_visited) between 2 and 160),
  country text not null check (char_length(country) between 2 and 80),
  description text not null check (char_length(description) between 40 and 5000),
  travel_tips text check (char_length(travel_tips) <= 2000),
  travel_date date not null check (travel_date <= current_date),
  rating smallint not null check (rating between 1 and 5),
  category text check (char_length(category) <= 60),
  visibility public.memory_visibility not null default 'public',
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memory_images (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references public.travel_memories(id) on delete cascade,
  storage_path text not null unique,
  image_url text not null default '',
  position smallint not null default 0 check (position between 0 and 7),
  created_at timestamptz not null default now(),
  unique (memory_id, position)
);

create table public.memory_likes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  memory_id uuid not null references public.travel_memories(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, memory_id)
);

create table public.saved_memories (
  user_id uuid not null references public.profiles(id) on delete cascade,
  memory_id uuid not null references public.travel_memories(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, memory_id)
);

create table public.content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  memory_id uuid not null references public.travel_memories(id) on delete cascade,
  reason text not null check (char_length(reason) between 10 and 1000),
  status public.report_status not null default 'open',
  created_at timestamptz not null default now(),
  unique (reporter_id, memory_id)
);

create table public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.app_role not null default 'member',
  primary key (user_id, role)
);

create index travel_memories_public_created_idx on public.travel_memories (created_at desc) where visibility = 'public';
create index travel_memories_user_date_idx on public.travel_memories (user_id, travel_date desc);
create index travel_memories_destination_idx on public.travel_memories (destination_id) where destination_id is not null;
create index travel_memories_search_idx on public.travel_memories using gin (to_tsvector('simple', title || ' ' || destination_name || ' ' || country || ' ' || description));
create index destinations_country_idx on public.destinations (country);
create index destinations_category_idx on public.destinations (category_id);
create index memory_images_memory_idx on public.memory_images (memory_id, position);
create index reports_status_idx on public.content_reports (status, created_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger destinations_updated_at before update on public.destinations for each row execute function public.set_updated_at();
create trigger travel_memories_updated_at before update on public.travel_memories for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  base_username text;
begin
  base_username := lower(regexp_replace(coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1), 'traveler'), '[^a-zA-Z0-9_-]', '-', 'g'));
  insert into public.profiles (id, username, display_name)
  values (new.id, left(base_username, 20) || '-' || left(new.id::text, 6), coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1), 'Traveler'));
  insert into public.user_roles (user_id, role) values (new.id, 'member');
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.is_admin(check_user uuid default auth.uid())
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.user_roles where user_id = check_user and role = 'admin');
$$;

alter table public.profiles enable row level security;
alter table public.destination_categories enable row level security;
alter table public.destinations enable row level security;
alter table public.travel_memories enable row level security;
alter table public.memory_images enable row level security;
alter table public.memory_likes enable row level security;
alter table public.saved_memories enable row level security;
alter table public.content_reports enable row level security;
alter table public.user_roles enable row level security;

create policy "Public profiles are readable" on public.profiles for select using (true);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "Categories are public" on public.destination_categories for select using (true);
create policy "Admins manage categories" on public.destination_categories for all using (public.is_admin()) with check (public.is_admin());
create policy "Destinations are public" on public.destinations for select using (true);
create policy "Admins manage destinations" on public.destinations for all using (public.is_admin()) with check (public.is_admin());

create policy "Public or owned memories are readable" on public.travel_memories for select using (visibility = 'public' or auth.uid() = user_id or public.is_admin());
create policy "Users create own memories" on public.travel_memories for insert with check (auth.uid() = user_id);
create policy "Users update own memories" on public.travel_memories for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Owners or admins delete memories" on public.travel_memories for delete using (auth.uid() = user_id or public.is_admin());

create policy "Images follow memory visibility" on public.memory_images for select using (exists(select 1 from public.travel_memories m where m.id = memory_id and (m.visibility = 'public' or m.user_id = auth.uid() or public.is_admin())));
create policy "Owners add image metadata" on public.memory_images for insert with check (exists(select 1 from public.travel_memories m where m.id = memory_id and m.user_id = auth.uid()));
create policy "Owners delete image metadata" on public.memory_images for delete using (exists(select 1 from public.travel_memories m where m.id = memory_id and m.user_id = auth.uid()));

create policy "Likes are readable" on public.memory_likes for select using (true);
create policy "Users create own likes" on public.memory_likes for insert with check (auth.uid() = user_id and exists(select 1 from public.travel_memories m where m.id = memory_id and m.visibility = 'public'));
create policy "Users delete own likes" on public.memory_likes for delete using (auth.uid() = user_id);
create policy "Users read own saves" on public.saved_memories for select using (auth.uid() = user_id);
create policy "Users create own saves" on public.saved_memories for insert with check (auth.uid() = user_id and exists(select 1 from public.travel_memories m where m.id = memory_id and m.visibility = 'public'));
create policy "Users delete own saves" on public.saved_memories for delete using (auth.uid() = user_id);

create policy "Users create reports" on public.content_reports for insert with check (auth.uid() = reporter_id);
create policy "Users read own reports" on public.content_reports for select using (auth.uid() = reporter_id or public.is_admin());
create policy "Admins update reports" on public.content_reports for update using (public.is_admin()) with check (public.is_admin());
create policy "Users read own roles" on public.user_roles for select using (auth.uid() = user_id or public.is_admin());
create policy "Admins manage roles" on public.user_roles for all using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('memory-images', 'memory-images', false, 8388608, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "Users upload to own folder" on storage.objects for insert to authenticated
with check (bucket_id = 'memory-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Owners manage own stored images" on storage.objects for update to authenticated
using (bucket_id = 'memory-images' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'memory-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Owners delete own stored images" on storage.objects for delete to authenticated
using (bucket_id = 'memory-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Authorized users read stored images" on storage.objects for select
using (
  bucket_id = 'memory-images' and (
    (storage.foldername(name))[1] = auth.uid()::text or
    exists (
      select 1 from public.memory_images i
      join public.travel_memories m on m.id = i.memory_id
      where i.storage_path = name and m.visibility = 'public'
    )
  )
);
