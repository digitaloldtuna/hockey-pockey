import { supabaseAdmin as supabase } from '../supabase';

export type Game = {
  id: number;
  easternStartTime: string; // ISO date string
  gameDate: string; // ISO date string (YYYY-MM-DD)
  gameNumber: number;
  gameScheduleStateId: number;
  gameStateId: number;
  gameType: number;
  homeScore: number;
  homeTeamId: number;
  period: number;
  season: number;
  visitingScore: number;
  visitingTeamId: number;
};

export const getGames = async ({ season }: { season?: number }): Promise<Game[]> => {
  if (!season) {
    season = 20252026;
  }
  const { data, error } = await supabase.from('games').select('*').eq('season', season);
  if (error) {
    throw Error(`Cannot fetch games: ${error}`);
  }
  return data;
};

export const updateOrCreateGames = async (games: Game[]) => {
  const { data, error } = await supabase.from('games').upsert(games, { onConflict: 'id' }).select();
  if (error) {
    throw Error(`Cannot update games: ${error.message}`);
  }
  console.log('Updated the following', data);
};

export const getGamesInTimeFrame = async ({
  start,
  end,
}: {
  start: string;
  end: string;
}): Promise<Game[]> => {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .gte('easternStartTime', start)
    .lte('easternStartTime', end)
    .eq('season', 20252026);

  if (error) {
    throw Error(`Cannot fetch games: ${error}`);
  }
  return data;
};
