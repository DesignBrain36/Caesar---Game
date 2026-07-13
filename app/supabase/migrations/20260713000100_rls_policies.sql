-- Enable RLS and add policies for the existing public schema tables.

alter table public.game_levels enable row level security;
alter table public.questions enable row level security;
alter table public.answers enable row level security;
alter table public.games enable row level security;
alter table public.user_answers enable row level security;

create policy "public can read game levels"
  on public.game_levels
  for select
  to anon, authenticated
  using (true);

create policy "authenticated can read questions"
  on public.questions
  for select
  to authenticated
  using (true);

create policy "authenticated can read answers"
  on public.answers
  for select
  to authenticated
  using (true);

create policy "authenticated can read own games"
  on public.games
  for select
  to authenticated
  using (owner = auth.uid());

create policy "authenticated can insert own games"
  on public.games
  for insert
  to authenticated
  with check (owner = auth.uid());

create policy "authenticated can update own games"
  on public.games
  for update
  to authenticated
  using (owner = auth.uid())
  with check (owner = auth.uid());

create policy "authenticated can delete own games"
  on public.games
  for delete
  to authenticated
  using (owner = auth.uid());

create policy "authenticated can read own user answers"
  on public.user_answers
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.games
      where games.id = user_answers.game_id
        and games.owner = auth.uid()
    )
  );

create policy "authenticated can insert own user answers"
  on public.user_answers
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.games
      where games.id = user_answers.game_id
        and games.owner = auth.uid()
    )
  );
