-- All reads and writes pass through the Maru Edge Function. The browser never
-- receives the server key or direct table privileges.
create table if not exists public.maru_progress (
  owner_id text primary key,
  snapshot jsonb not null default '{}'::jsonb,
  version bigint not null default 1 check (version > 0),
  updated_at timestamptz not null default now(),
  constraint maru_progress_owner_length check (length(owner_id) between 1 and 90),
  constraint maru_progress_snapshot_object check (jsonb_typeof(snapshot) = 'object')
);

create index if not exists maru_progress_updated_at_idx
  on public.maru_progress (updated_at desc);

alter table public.maru_progress enable row level security;
revoke all on public.maru_progress from anon, authenticated;
