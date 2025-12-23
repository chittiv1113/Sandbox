create extension if not exists pgcrypto;

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.room_secrets (
  room_id uuid primary key references public.rooms(id) on delete cascade,
  teacher_key text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  student_id uuid not null,
  display_name text null,
  kind text not null check (kind in ('note','code')),
  language text null,
  content text not null,
  status text not null default 'pending' check (status in ('pending','approved','hidden')),
  created_at timestamptz not null default now()
);

create index if not exists submissions_room_status_idx on public.submissions(room_id, status);
create index if not exists submissions_student_idx on public.submissions(student_id);

alter table public.rooms enable row level security;
alter table public.room_secrets enable row level security;
alter table public.submissions enable row level security;

drop policy if exists "rooms are readable" on public.rooms;
create policy "rooms are readable"
  on public.rooms for select
  to anon, authenticated
  using (true);

drop policy if exists "submissions readable (approved or own)" on public.submissions;
create policy "submissions readable (approved or own)"
  on public.submissions for select
  to anon, authenticated
  using ( status = 'approved' OR (auth.uid() is not null AND student_id = auth.uid()) );

drop policy if exists "submissions insert own pending" on public.submissions;
create policy "submissions insert own pending"
  on public.submissions for insert
  to authenticated
  with check ( auth.uid() is not null AND student_id = auth.uid() AND status = 'pending' );

-- No update/delete policies: teacher moderation uses server service role key via Next.js API.
