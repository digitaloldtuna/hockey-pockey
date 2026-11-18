import dotenv from 'dotenv';
dotenv.config();

import { refreshGames } from '../services/hockey_service';
import { loadMissingBoxscores } from '../services/boxscores';
import { sendResultNotifications } from '../services/result_notifications';

// Run by a Railway cron service every few minutes: refresh the games, tell people how their teams
// did, then store player stats for newly finished games (for head-to-head on the stats page).
// Add --dry-run (or NOTIFY_DRY_RUN=true) to print what would be sent without sending or storing.
const HARD_STOP_MS = 60 * 1000;
// player stats are loaded with whatever time is left, finishing well before the hard stop
const BOXSCORES_UNTIL_MS = 50 * 1000;
const startedAt = Date.now();

const dryRun = process.argv.includes('--dry-run') || process.env.NOTIFY_DRY_RUN === 'true';

// A stuck run would keep billing and block the next one, so it never lives past a minute.
const timer = setTimeout(() => {
  console.error('notify: hard stop after 60 seconds');
  process.exit(1);
}, HARD_STOP_MS);

const run = async () => {
  try {
    await refreshGames();
  } catch (error) {
    // still announce anything that is already final in the database
    console.error('notify: could not refresh games:', error);
  }
  await sendResultNotifications({ dryRun });
  if (!dryRun) {
    try {
      await loadMissingBoxscores({ stopAt: startedAt + BOXSCORES_UNTIL_MS });
    } catch (error) {
      // the notifications have gone out; player stats will catch up on a later run
      console.error('notify: could not load player stats:', error);
    }
  }
};

run()
  .then(() => {
    clearTimeout(timer);
    process.exit(0); // the database client keeps the process alive unless it is told to stop
  })
  .catch((error) => {
    console.error('notify failed:', error);
    clearTimeout(timer);
    process.exit(1);
  });
