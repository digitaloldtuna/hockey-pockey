import { supabaseAdmin } from '../supabase';

const supabase = supabaseAdmin();

// one player in one finished game (see sql/game_player_stats.sql)
export type GamePlayerStat = {
  game_id: number;
  player_id: number;
  team_id: number; // the NHL team id, the same as a team's apiId
  name: string; // as the boxscore gives it, e.g. "C. Sissons"
  is_goalie: boolean;
  goals: number;
  points: number;
  saves: number;
  shots_against: number;
  won: boolean;
};

// About 40 players dress per game, so 20 games stay under supabase's 1000-row limit per request
// and keep the list of ids in the address short.
const GAMES_PER_REQUEST = 20;

const inBatches = <T>(ids: number[], read: (batch: number[]) => Promise<T[]>) => {
  const batches: number[][] = [];
  for (let i = 0; i < ids.length; i += GAMES_PER_REQUEST) {
    batches.push(ids.slice(i, i + GAMES_PER_REQUEST));
  }
  return Promise.all(batches.map(read)).then((results) => results.flat());
};

// which of these games have had their boxscore loaded
export const getLoadedGameIds = async (gameIds: number[]): Promise<Set<number>> => {
  const rows = await inBatches(gameIds, async (batch) => {
    const { data, error } = await supabase
      .from('game_boxscores')
      .select('game_id')
      .in('game_id', batch);
    if (error) {
      throw Error(`Cannot read loaded boxscores: ${error.message}`);
    }
    return data as { game_id: number }[];
  });
  return new Set(rows.map((row) => Number(row.game_id)));
};

// every player's stats in these games
export const getPlayerStatsForGames = (gameIds: number[]): Promise<GamePlayerStat[]> =>
  inBatches(gameIds, async (batch) => {
    const { data, error } = await supabase
      .from('game_player_stats')
      .select('*')
      .in('game_id', batch);
    if (error) {
      throw Error(`Cannot read player stats: ${error.message}`);
    }
    return data as GamePlayerStat[];
  });

// Stores one game's player stats, then marks the game as loaded. In that order, so a game is
// never marked loaded without its stats; running it twice for the same game is harmless.
export const saveGamePlayerStats = async (gameId: number, stats: GamePlayerStat[]) => {
  if (stats.length > 0) {
    const { error } = await supabase
      .from('game_player_stats')
      .upsert(stats, { onConflict: 'game_id,player_id' });
    if (error) {
      throw Error(`Cannot save player stats for game ${gameId}: ${error.message}`);
    }
  }
  const { error } = await supabase
    .from('game_boxscores')
    .upsert({ game_id: gameId }, { onConflict: 'game_id' });
  if (error) {
    throw Error(`Cannot mark game ${gameId} as loaded: ${error.message}`);
  }
};
