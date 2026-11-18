# Hockey Pockey 💃

code for the draft site
hosted at https://hockey-pockey.up.railway.app/

### how to run locally

run `npm i` in client, server, and root

1. client-side: `npm run start`
2. server-side: `npm run dev`

### deploying

remember to lint with `npm run lint:fix` and ensure that the prettier precommit runs, and then just push!

### getting into shell

- run `npx tsx` in `server`
- to include env variables, run the following:

```
const { default: dotenv } = await import("dotenv");
dotenv.config()

// example job
const { PopulateTeamsDB } = await import("./src/jobs/nhl.ts");
await PopulateTeamsDB();
```

### head-to-head player stats

The stats page's "Best Players" against another person adds up each player's goals and saves in
just the games between your teams. Those per-game numbers come from each game's NHL boxscore and
are stored in Supabase, one row per player per game.

One-time setup:

1. In the Supabase SQL editor, run `server/sql/game_player_stats.sql` (safe to run twice).
2. Fill in the games already played: `npm run boxscores --prefix server`. The NHL allows about one
   request a second, so a few hundred games take a few minutes. It can be stopped and run again;
   it carries on where it left off.

After that the notify cron job stores new games as they finish (in whatever time it has left after
sending notifications). Until a pair's games are all stored, the card says it is still adding up.

### resources

- NHL API: https://github.com/Zmalski/NHL-API-Reference
