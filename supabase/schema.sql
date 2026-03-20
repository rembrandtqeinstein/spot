-- Spot: temporary location-based events
create table if not exists public.spots (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  location    jsonb not null,   -- { lat, lng, address }
  creator_name text not null,
  start_time  timestamptz not null,
  end_time    timestamptz not null,
  created_at  timestamptz not null default now(),

  constraint end_after_start check (end_time > start_time),
  constraint max_duration check (end_time - start_time <= interval '24 hours'),
  constraint start_within_24h check (start_time <= now() + interval '24 hours' + interval '5 minutes')
);

-- Index for time-range queries
create index if not exists spots_end_time_idx on public.spots (end_time);

-- Enable Row Level Security (RLS)
alter table public.spots enable row level security;

-- Allow anyone to read non-expired spots
create policy "Public read active spots"
  on public.spots for select
  using (end_time > now());

-- Allow anyone to insert (anonymous creation)
create policy "Public insert spots"
  on public.spots for insert
  with check (
    end_time > start_time
    and end_time - start_time <= interval '24 hours'
    and start_time >= now() - interval '5 minutes'
    and start_time <= now() + interval '24 hours' + interval '5 minutes'
  );

-- Enable realtime
alter publication supabase_realtime add table public.spots;
