-- Keep elevated helpers out of the exposed public API schema.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create function private.is_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = (select auth.uid()) and role = 'admin'
  );
$$;
revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to anon, authenticated;

alter policy "Public or owned memories are readable" on public.travel_memories
  using (visibility = 'public' or (select auth.uid()) = user_id or (select private.is_admin()));
alter policy "Owners or admins delete memories" on public.travel_memories
  using ((select auth.uid()) = user_id or (select private.is_admin()));
alter policy "Images follow memory visibility" on public.memory_images
  using (exists (
    select 1 from public.travel_memories m
    where m.id = memory_id
      and (m.visibility = 'public' or m.user_id = (select auth.uid()) or (select private.is_admin()))
  ));
alter policy "Users read own reports" on public.content_reports
  using ((select auth.uid()) = reporter_id or (select private.is_admin()));
alter policy "Admins update reports" on public.content_reports
  using ((select private.is_admin()))
  with check ((select private.is_admin()));
alter policy "Users read own roles" on public.user_roles
  using ((select auth.uid()) = user_id or (select private.is_admin()));

drop policy "Admins manage categories" on public.destination_categories;
create policy "Admins insert categories" on public.destination_categories for insert to authenticated
  with check ((select private.is_admin()));
create policy "Admins update categories" on public.destination_categories for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins delete categories" on public.destination_categories for delete to authenticated
  using ((select private.is_admin()));

drop policy "Admins manage destinations" on public.destinations;
create policy "Admins insert destinations" on public.destinations for insert to authenticated
  with check ((select private.is_admin()));
create policy "Admins update destinations" on public.destinations for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins delete destinations" on public.destinations for delete to authenticated
  using ((select private.is_admin()));

drop policy "Admins manage roles" on public.user_roles;
create policy "Admins insert roles" on public.user_roles for insert to authenticated
  with check ((select private.is_admin()));
create policy "Admins update roles" on public.user_roles for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins delete roles" on public.user_roles for delete to authenticated
  using ((select private.is_admin()));

revoke execute on function public.handle_new_user() from public, anon, authenticated;
drop function public.is_admin(uuid);
alter function public.set_updated_at() set search_path = '';

create index if not exists content_reports_memory_idx on public.content_reports (memory_id);
create index if not exists memory_likes_memory_idx on public.memory_likes (memory_id);
create index if not exists saved_memories_memory_idx on public.saved_memories (memory_id);
