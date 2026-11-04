import dotenv from 'dotenv';
dotenv.config();

import { refreshGames } from '../services/hockey_service';
import { sendResultNotifications } from '../services/result_notifications';

// Run by a Railway cron service every few minutes: refresh the games, then tell people how their
// teams did. Add --dry-run (or NOTIFY_DRY_RUN=true) to print what would be sent without sending.
const HARD_STOP_MS = 60 * 1000;

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
