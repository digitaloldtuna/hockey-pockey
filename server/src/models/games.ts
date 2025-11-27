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
    throw Error(`Error fetching games: ${error}`);
  }
  return data;
};
