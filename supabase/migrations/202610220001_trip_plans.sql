create table if not exists public.trip_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 120),
  start_date date not null,
  end_date date not null,
  budget_total integer check (budget_total is null or budget_total between 0 and 100000000),
  notes text not null default '' check (char_length(notes) <= 3000),
  stops jsonb not null default '[]'::jsonb check (jsonb_typeof(stops) = 'array' and jsonb_array_length(stops) <= 40),
  packing jsonb not null default '[]'::jsonb check (jsonb_typeof(packing) = 'array' and jsonb_array_length(packing) <= 100),
  expenses jsonb not null default '{}'::jsonb check (jsonb_typeof(expenses) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trip_plans_dates check (end_date >= start_date and end_date <= start_date + 60)
);

create index if not exists trip_plans_user_updated_idx on public.trip_plans (user_id, updated_at desc);
alter table public.trip_plans enable row level security;
revoke all on public.trip_plans from anon, authenticated;
grant select, insert, update, delete on public.trip_plans to authenticated;

create policy "Members read their own trips" on public.trip_plans for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Members create their own trips" on public.trip_plans for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Members update their own trips" on public.trip_plans for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Members delete their own trips" on public.trip_plans for delete to authenticated
  using ((select auth.uid()) = user_id);

create trigger trip_plans_updated_at before update on public.trip_plans
  for each row execute function public.set_updated_at();
