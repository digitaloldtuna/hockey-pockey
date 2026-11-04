-- Push notification tables.
-- Run this once in the Supabase SQL editor. Nothing else in the app depends on it until the
-- notification routes and the notify job are deployed.
--
-- Assumes profiles.id is a uuid (the app treats profile ids as strings). If it is a different type,
-- change the two "profile uuid" columns below to match before running.

create table if not exists push_subscriptions (
  id          bigint generated always as identity primary key,
  profile     uuid not null references profiles(id) on delete cascade,
  endpoint    text not null unique,
  p256dh      text not null,
  auth        text not null,
  user_agent  text,
  created_at  timestamptz not null default now()
);

create index if not exists push_subscriptions_profile_idx on push_subscriptions (profile);

-- One row per notification already claimed. The unique key is what stops a game being announced
-- twice to the same person in the same draft, even if two runs of the job overlap.
create table if not exists notification_log (
  id          bigint generated always as identity primary key,
  profile     uuid not null references profiles(id) on delete cascade,
  draft       bigint not null,
  game_id     bigint not null,
  kind        text not null default 'result',
  created_at  timestamptz not null default now(),
  unique (profile, draft, game_id, kind)
);

-- Only the server (service role key) touches these tables. Turning row level security on with no
-- policies means the public anon key cannot read or write them.
alter table push_subscriptions enable row level security;
alter table notification_log enable row level security;
