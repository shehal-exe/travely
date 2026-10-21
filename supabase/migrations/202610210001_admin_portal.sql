-- Only authenticated site administrators may see auth account metadata.
-- This function intentionally exposes a narrow, paginated projection of auth.users.
create or replace function public.admin_list_users(p_search text default '', p_page integer default 1)
returns table (
  id uuid,
  email text,
  display_name text,
  username text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  is_admin boolean,
  total_count bigint
)
language plpgsql stable security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null or not (select private.is_admin()) then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;
  if p_page is null or p_page < 1 or p_page > 10000 or char_length(coalesce(p_search, '')) > 120 then
    raise exception 'Invalid search or page' using errcode = '22023';
  end if;

  return query
    select u.id, u.email::text, p.display_name, p.username,
      u.created_at, u.last_sign_in_at,
      exists (select 1 from public.user_roles r where r.user_id = u.id and r.role = 'admin'),
      count(*) over ()
    from auth.users u
    left join public.profiles p on p.id = u.id
    where trim(coalesce(p_search, '')) = ''
      or u.email ilike '%' || trim(p_search) || '%'
      or p.display_name ilike '%' || trim(p_search) || '%'
      or p.username ilike '%' || trim(p_search) || '%'
    order by u.created_at desc, u.id
    limit 25 offset (p_page - 1) * 25;
end;
$$;

-- Role changes are atomic and cannot remove the final administrator.
create or replace function public.admin_set_user_role(p_user_id uuid, p_make_admin boolean)
returns void
language plpgsql security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null or not (select private.is_admin()) then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;
  if p_user_id is null or p_make_admin is null then
    raise exception 'A user and role are required' using errcode = '22023';
  end if;
  if not exists (select 1 from auth.users where id = p_user_id) then
    raise exception 'Account not found' using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(250551, 1);
  if p_make_admin then
    insert into public.user_roles (user_id, role) values (p_user_id, 'admin')
      on conflict (user_id, role) do nothing;
  else
    if p_user_id = (select auth.uid()) then
      raise exception 'You cannot remove your own administrator access' using errcode = '22023';
    end if;
    if (select count(*) from public.user_roles where role = 'admin') <= 1 then
      raise exception 'The final administrator cannot be removed' using errcode = '22023';
    end if;
    delete from public.user_roles where user_id = p_user_id and role = 'admin';
  end if;
end;
$$;

revoke all on function public.admin_list_users(text, integer) from public, anon;
revoke all on function public.admin_set_user_role(uuid, boolean) from public, anon;
grant execute on function public.admin_list_users(text, integer) to authenticated;
grant execute on function public.admin_set_user_role(uuid, boolean) to authenticated;

-- Prevent bypassing the final-admin guard through direct table writes.
drop policy if exists "Admins insert roles" on public.user_roles;
drop policy if exists "Admins update roles" on public.user_roles;
drop policy if exists "Admins delete roles" on public.user_roles;
revoke insert, update, delete on public.user_roles from anon, authenticated;
