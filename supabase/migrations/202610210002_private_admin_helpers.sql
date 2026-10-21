-- Keep privileged auth.users access outside the exposed public API schema.
alter function public.admin_list_users(text, integer) set schema private;
alter function public.admin_set_user_role(uuid, boolean) set schema private;

create function public.admin_list_users(p_search text default '', p_page integer default 1)
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
language sql stable security invoker
set search_path = ''
as $$
  select * from private.admin_list_users(p_search, p_page);
$$;

create function public.admin_set_user_role(p_user_id uuid, p_make_admin boolean)
returns void
language sql security invoker
set search_path = ''
as $$
  select private.admin_set_user_role(p_user_id, p_make_admin);
$$;

revoke all on function public.admin_list_users(text, integer) from public, anon;
revoke all on function public.admin_set_user_role(uuid, boolean) from public, anon;
grant execute on function public.admin_list_users(text, integer) to authenticated;
grant execute on function public.admin_set_user_role(uuid, boolean) to authenticated;
