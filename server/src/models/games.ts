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

// supabase queries max out at 1000 records, so anything that can be bigger is read a page at a time
const PAGE_SIZE = 1000;

const selectGames = () => supabase.from('games').select('*');
type GamesQuery = ReturnType<typeof selectGames>;

// Every game matching the filters. Pages are sorted by id: without a fixed order the database may
// return rows in a different order for each page, so a game could be skipped or read twice.
const getAllPages = async (
  filter: (query: GamesQuery) => GamesQuery,
  errorMessage: string
): Promise<Game[]> => {
  const results: Game[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await filter(selectGames())
      .order('id')
      .range(from, from + PAGE_SIZE - 1);
    if (error) {
      throw Error(`${errorMessage}: ${error.message}`);
    }
    results.push(...data);
    if (data.length < PAGE_SIZE) return results; // last page reached
  }
};

export const getGames = async ({ season }: { season?: number }): Promise<Game[]> => {
  if (!season) {
    season = await getCurrentSeason();
  }
  console.log(`Getting games for the ${season} season`);
  const apiSeason = getApiSeason(season);

  return getAllPages((query) => query.eq('season', apiSeason), 'Cannot fetch games');
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

  return getAllPages(
    (query) =>
      query
        .eq('season', apiSeason)
        .eq('gameStateId', 7)
        .in('homeTeamId', validTeams)
        .in('visitingTeamId', validTeams),
    'Cannot fetch games by teams'
  );
};

export const getAllCompletedGames = async ({ season }: { season?: number }) => {
  if (!season) {
    season = await getCurrentSeason();
  }
  const apiSeason = getApiSeason(season);

  return getAllPages(
    (query) => query.eq('season', apiSeason).eq('gameStateId', 7),
    'Cannot fetch completed games'
  );
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

// Games that have finished since a date (YYYY-MM-DD). Much cheaper than loading a whole season.
export const getFinishedGamesSince = async ({
  season,
  since,
}: {
  season: number;
  since: string;
}): Promise<Game[]> => {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('season', getApiSeason(season))
    .eq('gameStateId', 7)
    .gte('gameDate', since);
  if (error) {
    throw Error(`Cannot fetch finished games: ${error.message}`);
  }
  return data ?? [];
};
