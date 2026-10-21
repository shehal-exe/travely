-- Evaluate the request user once per statement rather than once per row.
alter policy "Users update own profile" on public.profiles
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

alter policy "Users create own memories" on public.travel_memories
  with check ((select auth.uid()) = user_id);
alter policy "Users update own memories" on public.travel_memories
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

alter policy "Owners add image metadata" on public.memory_images
  with check (exists (
    select 1 from public.travel_memories m
    where m.id = memory_id and m.user_id = (select auth.uid())
  ));
alter policy "Owners delete image metadata" on public.memory_images
  using (exists (
    select 1 from public.travel_memories m
    where m.id = memory_id and m.user_id = (select auth.uid())
  ));

alter policy "Users create own likes" on public.memory_likes
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.travel_memories m where m.id = memory_id and m.visibility = 'public')
  );
alter policy "Users delete own likes" on public.memory_likes
  using ((select auth.uid()) = user_id);

alter policy "Users read own saves" on public.saved_memories
  using ((select auth.uid()) = user_id);
alter policy "Users create own saves" on public.saved_memories
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.travel_memories m where m.id = memory_id and m.visibility = 'public')
  );
alter policy "Users delete own saves" on public.saved_memories
  using ((select auth.uid()) = user_id);

alter policy "Users create reports" on public.content_reports
  with check ((select auth.uid()) = reporter_id);
