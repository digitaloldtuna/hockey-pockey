import { getInPlayDrafts } from '../models/drafts';
import { Game, getAllCompletedGames } from '../models/games';
import { GamePlayerStat, getLoadedGameIds, saveGamePlayerStats } from '../models/game_player_stats';
import { BoxscoreGoalie, BoxscoreSkater, fetchBoxscore, sleep } from './nhl_api';

// The NHL allows about one request a second, so games are loaded one at a time with a pause.
const GAP_MS = 1100;

const rowsFor = (
  game: Game,
  side: 'home' | 'away',
  box: Awaited<ReturnType<typeof fetchBoxscore>>
) => {
  const teamId = side === 'home' ? game.homeTeamId : game.visitingTeamId;
  const players = box[side];
  const row = (p: BoxscoreSkater, goalie?: BoxscoreGoalie): GamePlayerStat => ({
    game_id: game.id,
    player_id: p.playerId,
    team_id: teamId,
    name: p.name,
    is_goalie: !!goalie,
    goals: p.goals,
    points: p.points,
    saves: goalie?.saves ?? 0,
    shots_against: goalie?.shotsAgainst ?? 0,
    won: goalie?.won ?? false,
  });
  return [...players.skaters.map((p) => row(p)), ...players.goalies.map((g) => row(g, g))];
};

// Loads the player stats of finished games that aren't stored yet, newest first, for the seasons
// of every draft in play. Stops early at `stopAt` (a time in ms) so a job with a time limit can
// leave the rest for its next run. Each game is stored once and never fetched again.
export const loadMissingBoxscores = async ({ stopAt }: { stopAt?: number } = {}) => {
  const seasons = Array.from(new Set((await getInPlayDrafts()).map((draft) => draft.season)));
  const finished: Game[] = [];
  for (const season of seasons) {
    finished.push(...(await getAllCompletedGames({ season })));
  }

  const loaded = await getLoadedGameIds(finished.map((game) => game.id));
  const missing = finished
    .filter((game) => !loaded.has(game.id))
    .sort((a, b) => b.easternStartTime.localeCompare(a.easternStartTime));

  let stored = 0;
  for (const game of missing) {
    if (stopAt && Date.now() + GAP_MS > stopAt) break;
    try {
      const box = await fetchBoxscore(game.id);
      await saveGamePlayerStats(game.id, [
        ...rowsFor(game, 'home', box),
        ...rowsFor(game, 'away', box),
      ]);
      stored += 1;
    } catch (error) {
      // left unmarked, so the next run tries it again
      console.error(`boxscores: could not load game ${game.id}:`, error);
    }
    await sleep(GAP_MS);
  }

  console.log(
    `boxscores: ${stored} games stored, ${missing.length - stored} still to load (${finished.length} finished games)`
  );
  return { stored, remaining: missing.length - stored };
};
