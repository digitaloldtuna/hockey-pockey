-- Per-game player stats, for the head-to-head "Best Players" on the stats page.
-- Run this once in the Supabase SQL editor. It is safe to run twice. Nothing reads these tables
-- until the code that fills them is deployed, and the stats page shows "still adding up" while
-- they are empty.
--
-- Filled from each finished game's NHL boxscore by the notify job (a few games each run) and by
-- the backfill script (npm run boxscores --prefix server). A finished game never changes, so each
-- game is loaded once.

-- One row per player who dressed in a finished game. team_id is the NHL team id (teams."apiId").
create table if not exists game_player_stats (
  game_id        bigint not null,
  player_id      bigint not null,
  team_id        int not null,
  name           text not null,          -- as the boxscore gives it, e.g. "C. Sissons"
  is_goalie      boolean not null default false,
  goals          int not null default 0,
  points         int not null default 0,
  saves          int not null default 0, -- goalies only
  shots_against  int not null default 0, -- goalies only
  won            boolean not null default false, -- goalies only: credited with the win
  primary key (game_id, player_id)
);

-- Games whose boxscore has been loaded, so a game with no stored rows can still be told apart from
-- one that hasn't been loaded yet.
create table if not exists game_boxscores (
  game_id    bigint primary key,
  loaded_at  timestamptz not null default now()
);

-- Only the server (service role key) touches these tables. Turning row level security on with no
-- policies means the public anon key cannot read or write them.
alter table game_player_stats enable row level security;
alter table game_boxscores enable row level security;
