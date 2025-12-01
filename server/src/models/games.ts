import { getCurrentSeason } from '../services/env_service';
import { supabaseAdmin } from '../supabase';
import { getApiSeason } from '../utils/mappings';

const supabase = supabaseAdmin();

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
  lastUpdated?: string;
};

export const getGames = async ({ season }: { season?: number }): Promise<Game[]> => {
  if (!season) {
    season = await getCurrentSeason();
  }
  console.log(`Getting games for the ${season} season`);
  season = getApiSeason(season);

  // supabase queries max out at 1000 records
  // to get all data we need to handle pagination
  const pageSize = 1000;
  let from = 0;
  let results: any[] = [];

  while (true) {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('season', season)
      .range(from, from + pageSize - 1);

    if (error) {
      throw Error(`Cannot fetch games: ${error}`);
    }

    results = results.concat(data);

    if (data.length < pageSize) break; // last page reached
    from += pageSize;
  }

  return results;
};

export const updateOrCreateGames = async (games: Game[]) => {
  if (games.length === 0) {
    console.log('No records to update');
  }
  const { data, error } = await supabase.from('games').upsert(games, { onConflict: 'id' }).select();
  if (error) {
    throw Error(`Cannot update games: ${error.message}`);
  }
  console.log('Updated', data.length, 'record.');
};

export const getGamesInTimeFrame = async ({
  start,
  end,
}: {
  start: string;
  end: string;
}): Promise<Game[]> => {
  const season = await getCurrentSeason();
  const apiSeason = getApiSeason(season);

  const dates: string[] = getDateRange(start, end);
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .in('gameDate', dates)
    .eq('season', apiSeason);

  if (error) {
    throw Error(`Cannot fetch games: ${error}`);
  }
  return data;
};

export const getCompletedGamesForSomeTeams = async ({
  season,
  selectedTeams,
  validTeams,
}: {
  season?: number;
  selectedTeams: number[];
  validTeams: number[];
}) => {
  if (!season) {
    season = await getCurrentSeason();
  }
  console.log('Getting completed games for the', season, 'season');
  const apiSeason = getApiSeason(season);

  if (selectedTeams.length === 0 || validTeams.length === 0) return [];
  const formatted = `(${selectedTeams.join(',')})`;

  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('season', apiSeason)
    .eq('gameStateId', 7)
    .in('homeTeamId', validTeams)
    .in('visitingTeamId', validTeams)
    .or(`homeTeamId.in.${formatted}, visitingTeamId.in.${formatted}`);

  if (error) {
    throw Error(`Cannot fetch games by teams: ${error.message}`);
  }
  return data;
};

export const getCompletedGamesForTeams = async ({
  season,
  validTeams,
}: {
  season?: number;
  validTeams: number[];
}) => {
  if (validTeams.length === 0) return [];

  if (!season) {
    season = await getCurrentSeason();
  }
  const apiSeason = getApiSeason(season);

  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('season', apiSeason)
    .eq('gameStateId', 7)
    .in('homeTeamId', validTeams)
    .in('visitingTeamId', validTeams);

  if (error) {
    throw Error(`Cannot fetch games by teams: ${error.message}`);
  }
  return data;
};

const getDateRange = (start: string, end: string): string[] => {
  const result: string[] = [];

  // Parse safely: avoid timezone shift
  const [sy, sm, sd] = start.split('-').map(Number);
  const [ey, em, ed] = end.split('-').map(Number);

  let current = new Date(sy, sm - 1, sd);
  const last = new Date(ey, em - 1, ed);

  while (current <= last) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');

    result.push(`${year}-${month}-${day}`);

    // move 1 day forward
    current.setDate(current.getDate() + 1);
  }

  return result;
};
