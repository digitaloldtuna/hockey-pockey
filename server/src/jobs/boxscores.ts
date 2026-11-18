import dotenv from 'dotenv';
dotenv.config();

import { loadMissingBoxscores } from '../services/boxscores';

// Stores player stats for every finished game that doesn't have them yet, for the head-to-head
// "Best Players" on the stats page. Run once after creating the tables in
// sql/game_player_stats.sql, to fill in the games already played; after that the notify job keeps
// up with new games. The NHL allows about one request a second, so a few hundred games take a few
// minutes. Safe to stop and run again: it carries on where it left off.
loadMissingBoxscores()
  .then(() => process.exit(0)) // the database client keeps the process alive unless told to stop
  .catch((error) => {
    console.error('boxscores failed:', error);
    process.exit(1);
  });
