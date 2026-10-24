-- Public traveller connections and comments on public travel stories.
create table public.traveller_follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint traveller_follows_not_self check (follower_id <> following_id)
);

create index traveller_follows_following_idx on public.traveller_follows (following_id, created_at desc);

create table public.memory_comments (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references public.travel_memories(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 2 and 1000),
  created_at timestamptz not null default now()
);

create index memory_comments_memory_created_idx on public.memory_comments (memory_id, created_at desc);
create index memory_comments_author_idx on public.memory_comments (author_id);

alter table public.traveller_follows enable row level security;
alter table public.memory_comments enable row level security;

create policy "Connections are public" on public.traveller_follows
  for select using (true);
create policy "Members follow as themselves" on public.traveller_follows
  for insert to authenticated with check ((select auth.uid()) = follower_id);
create policy "Members unfollow as themselves" on public.traveller_follows
  for delete to authenticated using ((select auth.uid()) = follower_id);

create policy "Comments on public memories are readable" on public.memory_comments
  for select using (exists (
    select 1 from public.travel_memories m
    where m.id = memory_id and m.visibility = 'public'
  ));
create policy "Members comment on public memories" on public.memory_comments
  for insert to authenticated with check (
    (select auth.uid()) = author_id and exists (
      select 1 from public.travel_memories m
      where m.id = memory_id and m.visibility = 'public'
    )
  );
create policy "Authors delete their comments" on public.memory_comments
  for delete to authenticated using ((select auth.uid()) = author_id);

-- New Supabase projects no longer expose newly created tables automatically.
revoke all on public.traveller_follows, public.memory_comments from anon, authenticated;
grant select on public.traveller_follows, public.memory_comments to anon;
grant select, insert, delete on public.traveller_follows, public.memory_comments to authenticated;

-- Return only one page of IDs. The caller fetches the story cards with existing
-- RLS-protected table queries, so profile/image joins keep their current behavior.
create function public.following_memory_ids(
  p_limit integer default 12,
  p_offset integer default 0,
  p_search text default '',
  p_min_rating integer default 0,
  p_duration text default 'all',
  p_sort text default 'newest'
)
returns table (memory_id uuid)
language sql stable security invoker set search_path = '' as $$
  select m.id
  from public.traveller_follows f
  join public.travel_memories m on m.user_id = f.following_id
  where f.follower_id = (select auth.uid()) and m.visibility = 'public'
    and (btrim(p_search) = '' or m.destination_name ilike '%' || replace(replace(left(btrim(p_search), 80), '%', ''), '_', '') || '%')
    and m.rating >= greatest(0, least(p_min_rating, 5))
    and (p_duration = 'all' or (p_duration = 'short' and m.days_spent <= 3) or (p_duration = 'long' and m.days_spent >= 4))
  order by
    case when p_sort = 'rating' then m.rating end desc nulls last,
    case when p_sort = 'budget' then m.total_expense end asc nulls last,
    m.created_at desc, m.id desc
  limit least(greatest(p_limit, 1), 24)
  offset least(greatest(p_offset, 0), 1200)
$$;

revoke all on function public.following_memory_ids(integer, integer, text, integer, text, text) from public, anon;
grant execute on function public.following_memory_ids(integer, integer, text, integer, text, text) to authenticated;

create index travel_memories_following_feed_idx
  on public.travel_memories (user_id, created_at desc, id desc)
  where visibility = 'public';
create index travel_memories_destination_public_idx
  on public.travel_memories (destination_id, created_at desc)
  where visibility = 'public' and destination_id is not null;
