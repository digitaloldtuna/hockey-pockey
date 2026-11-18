import { Game } from '../models/games';
import { GamesResponse, StandingsNowResponse, TeamsResponse } from '../types/nhlApiTypes';

const NHL_V1_BASE_URL = 'https://api-web.nhle.com/v1';
const NHL_REST_BASE_URL = 'https://api.nhle.com/stats/rest';

export const getStandingsNow = async (): Promise<StandingsNowResponse> => {
  const response = await fetch(`${NHL_V1_BASE_URL}/standings/now`);
  const data: StandingsNowResponse = await response.json();
  return data;
};

export const getTeams = async (): Promise<TeamsResponse> => {
  const response = await fetch(`${NHL_REST_BASE_URL}/en/team`);
  console.log('RESPONSE:', response);
  const data: TeamsResponse = await response.json();
  console.log('Data:', data);
  return data;
};

export const getGames = async (): Promise<Game[]> => {
  const response = await fetch(`${NHL_REST_BASE_URL}/en/game`);
  console.log('RESPONSE:', response);
  const data: GamesResponse = await response.json();
  return data.data;
};

// ---------------------------------------------------------------------------------------------
// Player and team stats for the stats page. These change a few times a night at most, so answers
// are kept for a while; otherwise every visit to the page would make 30+ calls to the NHL.

const STATS_CACHE_MS = 15 * 60 * 1000;
const statsCache = new Map<string, { at: number; data: Promise<unknown> }>();

const getCached = async <T>(url: string): Promise<T> => {
  const hit = statsCache.get(url);
  if (hit && Date.now() - hit.at < STATS_CACHE_MS) return hit.data as Promise<T>;

  const data = fetchPolitely(url).then((response) => {
    if (!response.ok) throw Error(`NHL API ${response.status} for ${url}`);
    return response.json();
  });
  // shared while in flight, so a burst of visits makes one call; dropped if it fails
  statsCache.set(url, { at: Date.now(), data });
  data.catch(() => statsCache.delete(url));
  return data;
};

type Name = { default: string };

export type ClubSkater = {
  playerId: number;
  headshot: string;
  firstName: Name;
  lastName: Name;
  positionCode: string;
  gamesPlayed: number;
  goals: number;
  assists: number;
  points: number;
  gameWinningGoals: number;
  overtimeGoals: number;
};

export type ClubGoalie = {
  playerId: number;
  headshot: string;
  firstName: Name;
  lastName: Name;
  gamesPlayed: number;
  wins: number;
  saves: number;
  shotsAgainst: number;
  savePercentage: number;
  shutouts: number;
};

// every player's stats for one team in one season (regular season)
export const getClubStats = (code: string, apiSeason: number) =>
  getCached<{ skaters: ClubSkater[]; goalies: ClubGoalie[] }>(
    `${NHL_V1_BASE_URL}/club-stats/${code}/${apiSeason}/2`
  );

export type TeamSummary = {
  teamId: number; // the same id as a team's apiId
  goalsFor: number;
};

export const getTeamSummaries = async (apiSeason: number) =>
  (
    await getCached<{ data: TeamSummary[] }>(
      `${NHL_REST_BASE_URL}/en/team/summary?cayenneExp=seasonId=${apiSeason}%20and%20gameTypeId=2`
    )
  ).data;

export type GoalLeader = {
  id: number;
  firstName: Name;
  lastName: Name;
  headshot: string;
  teamAbbrev: string;
  value: number;
};

export const getGoalLeaders = async (apiSeason: number, limit: number) =>
  (
    await getCached<{ goals: GoalLeader[] }>(
      `${NHL_V1_BASE_URL}/skater-stats-leaders/${apiSeason}/2?categories=goals&limit=${limit}`
    )
  ).goals;

export type GoalieSummary = {
  playerId: number;
  goalieFullName: string;
  teamAbbrevs: string; // "TOR" or, after a trade, "MIN, TOR"
  saves: number;
  savePct: number;
  gamesPlayed: number;
};

export const getSaveLeaders = async (apiSeason: number, limit: number) =>
  (
    await getCached<{ data: GoalieSummary[] }>(
      `${NHL_REST_BASE_URL}/en/goalie/summary?sort=saves&dir=DESC&limit=${limit}` +
        `&cayenneExp=seasonId=${apiSeason}%20and%20gameTypeId=2`
    )
  ).data;

export type LeagueStanding = {
  teamAbbrev: Name;
  teamName: Name;
  teamLogo: string;
  conferenceName: string;
  divisionName: string;
  leagueSequence: number;
  conferenceSequence: number;
  divisionSequence: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  otLosses: number;
  points: number;
  pointPctg: number;
  goalFor: number;
  goalAgainst: number;
  goalDifferential: number;
  l10Wins: number;
  l10Losses: number;
  l10OtLosses: number;
  streakCode?: string; // "W", "L" or "OT"
  streakCount?: number;
  clinchIndicator?: string; // "x", "y", "z" or "p" once a team has clinched something
};

type StandingsSeason = { id: number; standingsEnd: string };

// The official NHL standings for a season: today's for the season being played, otherwise the final
// table from the last day of that regular season.
export const getLeagueStandings = async (apiSeason: number) => {
  const { seasons } = await getCached<{ seasons: StandingsSeason[] }>(
    `${NHL_V1_BASE_URL}/standings-season`
  );
  const latest = seasons[seasons.length - 1];
  const season = seasons.find((s) => s.id === apiSeason);
  const date = !season || season.id === latest.id ? 'now' : season.standingsEnd;
  return getCached<{ standingsDateTimeUtc?: string; standings: LeagueStanding[] }>(
    `${NHL_V1_BASE_URL}/standings/${date}`
  );
};

// One finished game's player stats, cut down to what head-to-head needs
export type BoxscoreSkater = {
  playerId: number;
  name: string; // short, e.g. "C. Sissons"
  goals: number;
  points: number;
};
export type BoxscoreGoalie = BoxscoreSkater & {
  saves: number;
  shotsAgainst: number;
  won: boolean;
};
export type Boxscore = {
  home: { skaters: BoxscoreSkater[]; goalies: BoxscoreGoalie[] };
  away: { skaters: BoxscoreSkater[]; goalies: BoxscoreGoalie[] };
};

type RawSkater = { playerId: number; name: Name; goals: number; points: number };
type RawGoalie = RawSkater & { saves: number; shotsAgainst: number; decision?: string };
type RawSide = { forwards: RawSkater[]; defense: RawSkater[]; goalies: RawGoalie[] };

const toSide = (side: RawSide) => ({
  skaters: [...side.forwards, ...side.defense].map((p) => ({
    playerId: p.playerId,
    name: p.name.default,
    goals: p.goals ?? 0,
    points: p.points ?? 0,
  })),
  goalies: side.goalies
    // a backup who never went in has nothing to count
    .filter((g) => (g.shotsAgainst ?? 0) > 0)
    .map((g) => ({
      playerId: g.playerId,
      name: g.name.default,
      goals: g.goals ?? 0,
      points: g.points ?? 0,
      saves: g.saves ?? 0,
      shotsAgainst: g.shotsAgainst ?? 0,
      won: g.decision === 'W',
    })),
});

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// The NHL answers "429 too many requests" when asked for a lot at once. Wait and try again, for as
// long as it asks (Retry-After) or a little longer each time, before giving up.
const fetchPolitely = async (url: string, attempts = 5): Promise<Response> => {
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (response.status !== 429 || attempt === attempts) return response;
    const asked = Number(response.headers.get('retry-after'));
    await sleep(asked > 0 ? asked * 1000 : 500 * 2 ** attempt);
  }
};

// One game's boxscore: who played, and what each player did. Head-to-head player stats are built
// from these (see services/boxscores.ts, which stores them in the database once per game).
export const fetchBoxscore = async (gameId: number): Promise<Boxscore> => {
  const response = await fetchPolitely(`${NHL_V1_BASE_URL}/gamecenter/${gameId}/boxscore`);
  if (!response.ok) throw Error(`NHL API ${response.status} for boxscore ${gameId}`);
  const raw: { playerByGameStats: { homeTeam: RawSide; awayTeam: RawSide } } =
    await response.json();
  return {
    home: toSide(raw.playerByGameStats.homeTeam),
    away: toSide(raw.playerByGameStats.awayTeam),
  };
};
