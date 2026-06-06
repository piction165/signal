create extension if not exists "pgcrypto";

create table if not exists public.party_rooms (
  id uuid primary key default gen_random_uuid(),
  room_code text not null unique,
  name text,
  created_at timestamptz not null default now()
);

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.party_rooms(id) on delete cascade,
  nickname text not null,
  interests text[] not null default '{}',
  is_hidden boolean not null default false,
  is_online boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.signals (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.party_rooms(id) on delete cascade,
  sender_id uuid not null references public.participants(id) on delete cascade,
  receiver_id uuid not null references public.participants(id) on delete cascade,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  unique (room_id, sender_id, receiver_id)
);

alter table public.signals add column if not exists metadata jsonb not null default '{}';

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.party_rooms(id) on delete cascade,
  participant_a uuid not null references public.participants(id) on delete cascade,
  participant_b uuid not null references public.participants(id) on delete cascade,
  title text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.party_rooms(id) on delete cascade,
  recipient_id uuid not null references public.participants(id) on delete cascade,
  actor_id uuid references public.participants(id) on delete set null,
  type text not null check (
    type in (
      'received_signal',
      'mutual_match',
      'ai_topic',
      'game_invite',
      'host_announcement',
      'room_closing'
    )
  ),
  title text not null,
  body text,
  metadata jsonb not null default '{}',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.party_rooms(id) on delete cascade,
  created_by uuid references public.participants(id) on delete set null,
  game_type text not null check (
    game_type in (
      'topic_roulette',
      'question_roulette',
      'dice_mission',
      'love_fortune',
      'fortune_cookie',
      'ladder_game',
      'random_pairing',
      'ai_icebreaker',
      'game_invite'
    )
  ),
  participants uuid[] not null default '{}',
  input_data jsonb not null default '{}',
  result_data jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.game_sessions drop constraint if exists game_sessions_game_type_check;
alter table public.game_sessions add constraint game_sessions_game_type_check check (
  game_type in (
    'topic_roulette',
    'question_roulette',
    'dice_mission',
    'love_fortune',
    'fortune_cookie',
    'ladder_game',
    'random_pairing',
    'ai_icebreaker',
    'game_invite'
  )
);

create table if not exists public.game_invites (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.party_rooms(id) on delete cascade,
  game_session_id uuid references public.game_sessions(id) on delete cascade,
  sender_id uuid not null references public.participants(id) on delete cascade,
  receiver_id uuid not null references public.participants(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now()
);

create index if not exists participants_room_id_idx on public.participants(room_id);
create index if not exists signals_receiver_id_idx on public.signals(receiver_id);
create index if not exists signals_sender_id_idx on public.signals(sender_id);
create index if not exists notifications_recipient_id_idx on public.notifications(recipient_id, is_read, created_at desc);
create index if not exists game_sessions_room_id_idx on public.game_sessions(room_id, created_at desc);
create index if not exists game_invites_receiver_id_idx on public.game_invites(receiver_id, status);

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications') then
    alter publication supabase_realtime add table public.notifications;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'participants') then
    alter publication supabase_realtime add table public.participants;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'matches') then
    alter publication supabase_realtime add table public.matches;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'signals') then
    alter publication supabase_realtime add table public.signals;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'game_invites') then
    alter publication supabase_realtime add table public.game_invites;
  end if;
end $$;

alter table public.party_rooms enable row level security;
alter table public.participants enable row level security;
alter table public.signals enable row level security;
alter table public.matches enable row level security;
alter table public.notifications enable row level security;
alter table public.game_sessions enable row level security;
alter table public.game_invites enable row level security;

-- MVP preview policies. Replace with signed room-session checks before production.
drop policy if exists "mvp read rooms" on public.party_rooms;
drop policy if exists "mvp read participants" on public.participants;
drop policy if exists "mvp insert participants" on public.participants;
drop policy if exists "mvp read signals" on public.signals;
drop policy if exists "mvp insert signals" on public.signals;
drop policy if exists "mvp read matches" on public.matches;
drop policy if exists "mvp read notifications" on public.notifications;
drop policy if exists "mvp insert notifications" on public.notifications;
drop policy if exists "mvp update notifications" on public.notifications;
drop policy if exists "mvp read game sessions" on public.game_sessions;
drop policy if exists "mvp insert game sessions" on public.game_sessions;
drop policy if exists "mvp read game invites" on public.game_invites;
drop policy if exists "mvp insert game invites" on public.game_invites;
drop policy if exists "mvp update game invites" on public.game_invites;

create policy "mvp read rooms" on public.party_rooms for select using (true);
create policy "mvp read participants" on public.participants for select using (true);
create policy "mvp insert participants" on public.participants for insert with check (true);
create policy "mvp read signals" on public.signals for select using (true);
create policy "mvp insert signals" on public.signals for insert with check (true);
create policy "mvp read matches" on public.matches for select using (true);
create policy "mvp read notifications" on public.notifications for select using (true);
create policy "mvp insert notifications" on public.notifications for insert with check (true);
create policy "mvp update notifications" on public.notifications for update using (true);
create policy "mvp read game sessions" on public.game_sessions for select using (true);
create policy "mvp insert game sessions" on public.game_sessions for insert with check (true);
create policy "mvp read game invites" on public.game_invites for select using (true);
create policy "mvp insert game invites" on public.game_invites for insert with check (true);
create policy "mvp update game invites" on public.game_invites for update using (true);
