-- Admin helpers and policies for privileged access.

create or replace function public.is_admin()
returns boolean
language plpgsql
stable
as $$
declare
  app_role text;
  app_roles jsonb;
begin
  app_role := coalesce(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() ->> 'role');
  app_roles := auth.jwt() -> 'app_metadata' -> 'roles';

  return coalesce(app_role = 'admin', false)
    or coalesce(app_roles ? 'admin', false);
end;
$$;

create or replace function public.admin_list_users()
returns table (
  id uuid,
  email text,
  role text,
  nickname text,
  avatar_url text,
  avatar_path text,
  created_at timestamptz,
  last_sign_in_at timestamptz
)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin access required.' using errcode = '42501';
  end if;

  return query
    select
      users.id,
      users.email,
      coalesce(users.raw_app_meta_data ->> 'role', '') as role,
      coalesce(users.raw_user_meta_data ->> 'nickname', '') as nickname,
      coalesce(users.raw_user_meta_data ->> 'avatar_url', '') as avatar_url,
      coalesce(users.raw_user_meta_data ->> 'avatar_path', '') as avatar_path,
      users.created_at,
      users.last_sign_in_at
    from auth.users as users
    order by users.created_at desc;
end;
$$;

create or replace function public.admin_update_user(
  target_user_id uuid,
  user_metadata jsonb,
  app_metadata jsonb
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin access required.' using errcode = '42501';
  end if;

  update auth.users
  set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || coalesce(user_metadata, '{}'::jsonb),
      raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || coalesce(app_metadata, '{}'::jsonb)
  where id = target_user_id;

  if not found then
    raise exception 'User not found.' using errcode = 'P0002';
  end if;
end;
$$;

create or replace function public.admin_delete_user(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin access required.' using errcode = '42501';
  end if;

  delete from auth.users
  where id = target_user_id;

  if not found then
    raise exception 'User not found.' using errcode = 'P0002';
  end if;
end;
$$;

grant execute on function public.admin_list_users() to authenticated;
grant execute on function public.admin_update_user(uuid, jsonb, jsonb) to authenticated;
grant execute on function public.admin_delete_user(uuid) to authenticated;

drop policy if exists "admin can read any game levels" on public.game_levels;
create policy "admin can read any game levels"
  on public.game_levels
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "admin can insert game levels" on public.game_levels;
create policy "admin can insert game levels"
  on public.game_levels
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "admin can update game levels" on public.game_levels;
create policy "admin can update game levels"
  on public.game_levels
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admin can delete game levels" on public.game_levels;
create policy "admin can delete game levels"
  on public.game_levels
  for delete
  to authenticated
  using (public.is_admin());

drop policy if exists "admin can read any questions" on public.questions;
create policy "admin can read any questions"
  on public.questions
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "admin can insert questions" on public.questions;
create policy "admin can insert questions"
  on public.questions
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "admin can update questions" on public.questions;
create policy "admin can update questions"
  on public.questions
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admin can delete questions" on public.questions;
create policy "admin can delete questions"
  on public.questions
  for delete
  to authenticated
  using (public.is_admin());

drop policy if exists "admin can read any answers" on public.answers;
create policy "admin can read any answers"
  on public.answers
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "admin can insert answers" on public.answers;
create policy "admin can insert answers"
  on public.answers
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "admin can update answers" on public.answers;
create policy "admin can update answers"
  on public.answers
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admin can delete answers" on public.answers;
create policy "admin can delete answers"
  on public.answers
  for delete
  to authenticated
  using (public.is_admin());

drop policy if exists "admin can read any games" on public.games;
create policy "admin can read any games"
  on public.games
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "admin can insert games" on public.games;
create policy "admin can insert games"
  on public.games
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "admin can update games" on public.games;
create policy "admin can update games"
  on public.games
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admin can delete games" on public.games;
create policy "admin can delete games"
  on public.games
  for delete
  to authenticated
  using (public.is_admin());

drop policy if exists "admin can read any user answers" on public.user_answers;
create policy "admin can read any user answers"
  on public.user_answers
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "admin can insert user answers" on public.user_answers;
create policy "admin can insert user answers"
  on public.user_answers
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "admin can update user answers" on public.user_answers;
create policy "admin can update user answers"
  on public.user_answers
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admin can delete user answers" on public.user_answers;
create policy "admin can delete user answers"
  on public.user_answers
  for delete
  to authenticated
  using (public.is_admin());

drop policy if exists "admin can read any avatars" on storage.objects;
create policy "admin can read any avatars"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'avatars' and public.is_admin());

drop policy if exists "admin can upload any avatars" on storage.objects;
create policy "admin can upload any avatars"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'avatars' and public.is_admin());

drop policy if exists "admin can update any avatars" on storage.objects;
create policy "admin can update any avatars"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'avatars' and public.is_admin())
  with check (bucket_id = 'avatars' and public.is_admin());

drop policy if exists "admin can delete any avatars" on storage.objects;
create policy "admin can delete any avatars"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'avatars' and public.is_admin());