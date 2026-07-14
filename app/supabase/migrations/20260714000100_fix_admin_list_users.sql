drop function if exists public.admin_list_users();

create function public.admin_list_users()
returns table (
  id uuid,
  email text,
  nickname text,
  avatar_url text,
  avatar_path text,
  role text,
  created_at timestamptz,
  last_sign_in_at timestamptz
)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;

  return query
  select
    u.id,
    u.email::text,
    coalesce(u.raw_user_meta_data ->> 'nickname', '')::text,
    coalesce(u.raw_user_meta_data ->> 'avatar_url', '')::text,
    coalesce(u.raw_user_meta_data ->> 'avatar_path', '')::text,
    coalesce(
      u.raw_app_meta_data ->> 'role',
      case
        when (u.raw_app_meta_data -> 'roles') ? 'admin' then 'admin'
        else 'user'
      end
    )::text,
    u.created_at,
    u.last_sign_in_at
  from auth.users u
  order by u.created_at desc;
end;
$$;

grant execute on function public.admin_list_users() to authenticated;

notify pgrst, 'reload schema';