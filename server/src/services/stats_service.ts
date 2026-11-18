import { getDraftFromId } from '../models/drafts';
import { Game, getGames } from '../models/games';
import { Profile } from '../models/profiles';
import { getLoadedGameIds, getPlayerStatsForGames } from '../models/game_player_stats';
import { getTeamOwnershipsFromDraft } from '../models/team_ownerships';
import { getAllTeams } from '../models/teams';
import { getApiSeason } from '../utils/mappings';
import { annotateGames, getLeaderboard, partitionGamesByDate } from './hockey_service';
import {
  ClubGoalie,
  ClubSkater,
  getClubStats,
  getGoalLeaders,
  getLeagueStandings,
  getSaveLeaders,
  getTeamSummaries,
} from './nhl_api';

const LEADERS = 5;

type Player = {
  id: number;
  name: string;
  headshot: string;
  team: string; // three-letter code
  teamName: string; // "Edmonton Oilers"
};

type TeamInfo = { code: string; fullName: string; logo?: string };

// you against one other person in the draft
// a player's numbers only in the games between two people's teams
type VersusScorer = Player & { goals: number; points: number; gamesPlayed: number };
type VersusGoalie = Player & {
  saves: number;
  savePercentage: number;
  wins: number;
  gamesPlayed: number;
};
type VersusSide = { scorer: VersusScorer | null; goalie: VersusGoalie | null };

export type HeadToHead = {
  wins: number; // games your teams won against theirs
  losses: number; // games their teams won against yours
  points: { mine: number; theirs: number }; // leaderboard points
  myBestTeam: { team: TeamInfo; wins: number } | null; // your team that has beaten them most
  theirBestTeam: { team: TeamInfo; wins: number } | null; // their team that has beaten you most
  upcoming: [string, Game[]][]; // games between your teams and theirs in the next few days, by day
  nextMeeting: Game | null; // the next game between you, however far off
  // each side's best scorer and goalie in the games between you; null until every one of those
  // games has been counted
  bestPlayers: { mine: VersusSide; theirs: VersusSide } | null;
  gamesStillToCount: number; // finished games between you whose player stats are still loading
};

// how many days of games between you are listed, starting today
const UPCOMING_DAYS = 3;

export type OwnerStats = {
  member: Profile;
  teams: TeamInfo[];
  goals: number | null; // goals scored by all of this person's teams
  bestScorer: (Player & { goals: number; points: number; gamesPlayed: number }) | null;
  bestGoalie:
    | (Player & { saves: number; savePercentage: number; wins: number; gamesPlayed: number })
    | null;
};

export type DraftStats = {
  season: number;
  owners: OwnerStats[];
  clutch: (Player & { member: Profile; gameWinningGoals: number; overtimeGoals: number })[] | null;
  leaders: {
    goals: (Player & { member: Profile | null; goals: number })[];
    saves: (Player & { member: Profile | null; saves: number; savePercentage: number })[];
  } | null;
  headToHead: Record<string, HeadToHead>; // keyed by the other person's profile id
};

const fullName = (p: { firstName: { default: string }; lastName: { default: string } }) =>
  `${p.firstName.default} ${p.lastName.default}`;

// a section whose NHL source fails is left empty instead of breaking the whole page
const settle = async <T>(label: string, work: Promise<T>): Promise<T | null> => {
  try {
    return await work;
  } catch (error) {
    console.error(`stats: could not load ${label}:`, error);
    return null;
  }
};

// more goals first, then more points
const byGoals = (a: { goals: number; points: number }, b: { goals: number; points: number }) =>
  b.goals - a.goals || b.points - a.points;

export const getDraftStats = async (draftId: number, memberId: string): Promise<DraftStats> => {
  // also checks the person asking is in this draft
  const draft = await getDraftFromId(draftId, memberId);
  const apiSeason = getApiSeason(draft.season);
  const ownerships = await getTeamOwnershipsFromDraft(draftId);

  const ownerByCode = new Map<string, Profile>();
  const owners = new Map<string, OwnerStats>();
  ownerships.forEach(({ team, draftMembership }) => {
    const member = draftMembership.profile;
    ownerByCode.set(team.code, member);
    if (!owners.has(member.id)) {
      owners.set(member.id, {
        member,
        teams: [],
        goals: null,
        bestScorer: null,
        bestGoalie: null,
      });
    }
    owners
      .get(member.id)!
      .teams.push({ code: team.code, fullName: team.fullName, logo: team.logo });
  });
  const ownerOf = (code: string) => ownerByCode.get(code) ?? null;

  const teams = ownerships.map(({ team }) => team);
  const [clubStats, summaries, goalLeaders, saveLeaders, allTeams, games, leaderboard] =
    await Promise.all([
      settle(
        'club stats',
        Promise.all(
          teams.map(async (team) => ({ team, stats: await getClubStats(team.code, apiSeason) }))
        )
      ),
      settle('team summaries', getTeamSummaries(apiSeason)),
      settle('goal leaders', getGoalLeaders(apiSeason, LEADERS)),
      settle('save leaders', getSaveLeaders(apiSeason, LEADERS)),
      getAllTeams(),
      getGames({ season: draft.season }),
      getLeaderboard(draftId),
    ]);

  // each person's best scorer and best goalie, from every player on their teams
  const clutch: NonNullable<DraftStats['clutch']> = [];
  clubStats?.forEach(({ team, stats }) => {
    const owner = owners.get(ownerByCode.get(team.code)!.id)!;
    const player = (p: ClubSkater | ClubGoalie): Player => ({
      id: p.playerId,
      name: fullName(p),
      headshot: p.headshot,
      team: team.code,
      teamName: team.fullName,
    });

    const scorer = [...stats.skaters].sort(byGoals)[0];
    if (scorer && (!owner.bestScorer || byGoals(scorer, owner.bestScorer) < 0)) {
      owner.bestScorer = {
        ...player(scorer),
        goals: scorer.goals,
        points: scorer.points,
        gamesPlayed: scorer.gamesPlayed,
      };
    }

    const goalie = [...stats.goalies].sort((a, b) => b.saves - a.saves)[0];
    if (goalie && (!owner.bestGoalie || goalie.saves > owner.bestGoalie.saves)) {
      owner.bestGoalie = {
        ...player(goalie),
        saves: goalie.saves,
        savePercentage: goalie.savePercentage,
        wins: goalie.wins,
        gamesPlayed: goalie.gamesPlayed,
      };
    }

    stats.skaters
      .filter((p) => p.gameWinningGoals + p.overtimeGoals > 0)
      .forEach((p) =>
        clutch.push({
          ...player(p),
          member: owner.member,
          gameWinningGoals: p.gameWinningGoals,
          overtimeGoals: p.overtimeGoals,
        })
      );
  });
  clutch.sort(
    (a, b) =>
      b.gameWinningGoals - a.gameWinningGoals ||
      b.overtimeGoals - a.overtimeGoals ||
      a.name.localeCompare(b.name)
  );

  // goals scored by each person's teams
  if (summaries) {
    const goalsFor = new Map(summaries.map((s) => [s.teamId, s.goalsFor]));
    ownerships.forEach(({ team, draftMembership }) => {
      const owner = owners.get(draftMembership.profile.id)!;
      owner.goals = (owner.goals ?? 0) + (goalsFor.get(Number(team.apiId)) ?? 0);
    });
  }

  // leaders can play for any team, drafted or not, so names come from the whole league
  const nameByCode = new Map(allTeams.map((team) => [team.code, team.fullName]));
  const teamName = (code: string) => nameByCode.get(code) ?? code;

  const headToHead = await getHeadToHead({
    me: memberId,
    others: draft.members
      .map((member: Profile) => member.id)
      .filter((id: string) => id !== memberId),
    ownerships,
    games,
    leaderboard,
    apiSeason,
    // full names and photos for players, from the team stats already loaded
    playerInfo: new Map(
      (clubStats ?? []).flatMap(({ stats }) =>
        [...stats.skaters, ...stats.goalies].map((p) => [
          p.playerId,
          { name: fullName(p), headshot: p.headshot },
        ])
      )
    ),
  });

  return {
    season: apiSeason,
    owners: Array.from(owners.values()).sort((a, b) => (b.goals ?? 0) - (a.goals ?? 0)),
    clutch: clubStats ? clutch.slice(0, LEADERS) : null,
    leaders:
      goalLeaders && saveLeaders
        ? {
            goals: goalLeaders.map((p) => ({
              id: p.id,
              name: fullName(p),
              headshot: p.headshot,
              team: p.teamAbbrev,
              teamName: teamName(p.teamAbbrev),
              member: ownerOf(p.teamAbbrev),
              goals: p.value,
            })),
            saves: saveLeaders.map((g) => {
              // after a trade this lists every team; the last one is where they are now
              const team = g.teamAbbrevs.split(',').pop()!.trim();
              return {
                id: g.playerId,
                name: g.goalieFullName,
                // the stats API has no photo field, but headshots all live at this address
                headshot: `https://assets.nhle.com/mugs/nhl/${apiSeason}/${team}/${g.playerId}.png`,
                team,
                teamName: teamName(team),
                member: ownerOf(team),
                saves: g.saves,
                savePercentage: g.savePct,
              };
            }),
          }
        : null,
    headToHead,
  };
};

const todayInEastern = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());

// a YYYY-MM-DD date some days later
const addDays = (date: string, days: number) => {
  const next = new Date(`${date}T12:00:00Z`);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
};

// running totals for one side's players across the games between two people
const newSideTally = () => ({
  skaters: new Map<
    number,
    { playerId: number; name: string; goals: number; points: number; games: number; apiId: number }
  >(),
  goalies: new Map<
    number,
    {
      playerId: number;
      name: string;
      saves: number;
      shotsAgainst: number;
      wins: number;
      games: number;
      apiId: number;
    }
  >(),
});

// the team with the most wins in a tally, or null when there were none
const mostWins = (tally: Map<number, number>, teamOf: (apiId: number) => TeamInfo) => {
  let best: { team: TeamInfo; wins: number } | null = null;
  tally.forEach((wins, apiId) => {
    if (!best || wins > best.wins) best = { team: teamOf(apiId), wins };
  });
  return best;
};

// How you have done against each other person: every finished game between your teams and theirs,
// plus the ones still to come.
const getHeadToHead = async ({
  me,
  others,
  ownerships,
  games,
  leaderboard,
  apiSeason,
  playerInfo,
}: {
  me: string;
  others: string[];
  ownerships: Awaited<ReturnType<typeof getTeamOwnershipsFromDraft>>;
  games: Game[];
  leaderboard: { id: string; score: number }[];
  apiSeason: number;
  playerInfo: Map<number, { name: string; headshot: string }>;
}): Promise<Record<string, HeadToHead>> => {
  const ownerOf = new Map(
    ownerships.map((o) => [Number(o.team.apiId), o.draftMembership.profile.id])
  );
  const teamByApiId = new Map(
    ownerships.map(({ team }) => [
      Number(team.apiId),
      { code: team.code, fullName: team.fullName, logo: team.logo },
    ])
  );
  const scoreOf = (id: string) => leaderboard.find((entry) => entry.id === id)?.score ?? 0;
  const today = todayInEastern();
  const lastUpcomingDay = addDays(today, UPCOMING_DAYS - 1);

  const tallies = new Map(
    others.map((id) => [
      id,
      {
        wins: 0,
        losses: 0,
        myTeams: new Map<number, number>(), // my team -> wins against them
        theirTeams: new Map<number, number>(), // their team -> wins against me
        upcoming: [] as Game[],
        finished: [] as Game[],
      },
    ])
  );

  games.forEach((game) => {
    const home = ownerOf.get(game.homeTeamId);
    const away = ownerOf.get(game.visitingTeamId);
    if (!home || !away || home === away || (home !== me && away !== me)) return;
    const tally = tallies.get(home === me ? away : home);
    if (!tally) return;

    if (game.gameStateId !== 7) {
      if (game.gameDate >= today) tally.upcoming.push(game);
      return;
    }
    if (game.homeScore === game.visitingScore) return;
    tally.finished.push(game);

    const winningTeam = game.homeScore > game.visitingScore ? game.homeTeamId : game.visitingTeamId;
    const iWon = ownerOf.get(winningTeam) === me;
    const teams = iWon ? tally.myTeams : tally.theirTeams;
    teams.set(winningTeam, (teams.get(winningTeam) ?? 0) + 1);
    if (iWon) tally.wins += 1;
    else tally.losses += 1;
  });

  // Per-game player stats are stored by the notify job and the backfill script (see
  // services/boxscores.ts); games not stored yet are counted as still to come.
  const finishedIds = Array.from(
    new Set(Array.from(tallies.values()).flatMap((t) => t.finished.map((g) => g.id)))
  );
  // until sql/game_player_stats.sql has been run these tables don't exist; the rest of the page
  // still works and Best Players says it is still adding up
  const loaded = (await settle('loaded boxscores', getLoadedGameIds(finishedIds))) ?? new Set();
  const playerStats =
    (await settle('player stats', getPlayerStatsForGames(Array.from(loaded)))) ?? [];
  if (playerStats.length === 0) loaded.clear(); // never claim games are counted without their stats
  const statsByGame = new Map<number, typeof playerStats>();
  playerStats.forEach((row) => {
    const gameId = Number(row.game_id);
    statsByGame.set(gameId, [...(statsByGame.get(gameId) ?? []), row]);
  });

  // the best scorer and goalie on each side, counting only these games
  const bestPlayersIn = (finished: Game[]) => {
    const sides = { mine: newSideTally(), theirs: newSideTally() };
    finished.forEach((game) => {
      (statsByGame.get(game.id) ?? []).forEach((row) => {
        const apiId = Number(row.team_id);
        const playerId = Number(row.player_id);
        const side = ownerOf.get(apiId) === me ? sides.mine : sides.theirs;
        if (row.is_goalie) {
          const entry = side.goalies.get(playerId) ?? {
            playerId,
            name: row.name,
            saves: 0,
            shotsAgainst: 0,
            wins: 0,
            games: 0,
            apiId,
          };
          entry.saves += row.saves;
          entry.shotsAgainst += row.shots_against;
          entry.wins += row.won ? 1 : 0;
          entry.games += 1;
          entry.apiId = apiId; // the team they played for most recently against this person
          side.goalies.set(playerId, entry);
        } else {
          const entry = side.skaters.get(playerId) ?? {
            playerId,
            name: row.name,
            goals: 0,
            points: 0,
            games: 0,
            apiId,
          };
          entry.goals += row.goals;
          entry.points += row.points;
          entry.games += 1;
          entry.apiId = apiId;
          side.skaters.set(playerId, entry);
        }
      });
    });

    const player = (p: { playerId: number; name: string; apiId: number }): Player => {
      const team = teamByApiId.get(p.apiId)!;
      const info = playerInfo.get(p.playerId);
      return {
        id: p.playerId,
        name: info?.name ?? p.name,
        // the same address every NHL headshot uses, for anyone the team stats didn't list
        headshot:
          info?.headshot ??
          `https://assets.nhle.com/mugs/nhl/${apiSeason}/${team.code}/${p.playerId}.png`,
        team: team.code,
        teamName: team.fullName,
      };
    };
    const pick = (side: ReturnType<typeof newSideTally>): VersusSide => {
      const scorer = Array.from(side.skaters.values()).sort(
        (a, b) => b.goals - a.goals || b.points - a.points || a.games - b.games
      )[0];
      const goalie = Array.from(side.goalies.values()).sort((a, b) => b.saves - a.saves)[0];
      return {
        scorer:
          scorer && scorer.goals > 0
            ? {
                ...player(scorer),
                goals: scorer.goals,
                points: scorer.points,
                gamesPlayed: scorer.games,
              }
            : null,
        goalie: goalie
          ? {
              ...player(goalie),
              saves: goalie.saves,
              savePercentage: goalie.shotsAgainst ? goalie.saves / goalie.shotsAgainst : 0,
              wins: goalie.wins,
              gamesPlayed: goalie.games,
            }
          : null,
      };
    };
    return { mine: pick(sides.mine), theirs: pick(sides.theirs) };
  };

  const result: Record<string, HeadToHead> = {};
  for (const [id, tally] of Array.from(tallies.entries())) {
    const ahead = tally.upcoming.sort((a, b) =>
      a.easternStartTime.localeCompare(b.easternStartTime)
    );
    const soon = ahead.filter((game) => game.gameDate <= lastUpcomingDay);
    const [nextMeeting] = ahead.length > 0 ? await annotateGames([ahead[0]], ownerships) : [];
    result[id] = {
      wins: tally.wins,
      losses: tally.losses,
      points: { mine: scoreOf(me), theirs: scoreOf(id) },
      myBestTeam: mostWins(tally.myTeams, (apiId) => teamByApiId.get(apiId)!),
      theirBestTeam: mostWins(tally.theirTeams, (apiId) => teamByApiId.get(apiId)!),
      upcoming: partitionGamesByDate(await annotateGames(soon, ownerships)),
      nextMeeting: nextMeeting ?? null,
      ...(() => {
        const stillToCount = tally.finished.filter((game) => !loaded.has(game.id)).length;
        return {
          bestPlayers: stillToCount === 0 ? bestPlayersIn(tally.finished) : null,
          gamesStillToCount: stillToCount,
        };
      })(),
    };
  }
  return result;
};

export type LeagueStandingRow = {
  code: string;
  name: string;
  logo: string;
  conference: string;
  division: string;
  leagueRank: number;
  conferenceRank: number;
  divisionRank: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  otLosses: number;
  points: number;
  pointPct: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifferential: number;
  lastTen: string; // "8-1-1"
  streak: string | null; // "W5"
  clinched: string | null;
  member: Profile | null; // who drafted this team
};

// The NHL's own standings for the draft's season, with each team's owner in this draft
export const getDraftLeagueStandings = async (draftId: number, memberId: string) => {
  // also checks the person asking is in this draft
  const draft = await getDraftFromId(draftId, memberId);
  const [ownerships, standings] = await Promise.all([
    getTeamOwnershipsFromDraft(draftId),
    getLeagueStandings(getApiSeason(draft.season)),
  ]);
  const ownerByCode = new Map(
    ownerships.map(({ team, draftMembership }) => [team.code, draftMembership.profile])
  );

  const rows: LeagueStandingRow[] = standings.standings
    .map((s) => ({
      code: s.teamAbbrev.default,
      name: s.teamName.default,
      logo: s.teamLogo,
      conference: s.conferenceName,
      division: s.divisionName,
      leagueRank: s.leagueSequence,
      conferenceRank: s.conferenceSequence,
      divisionRank: s.divisionSequence,
      gamesPlayed: s.gamesPlayed,
      wins: s.wins,
      losses: s.losses,
      otLosses: s.otLosses,
      points: s.points,
      pointPct: s.pointPctg,
      goalsFor: s.goalFor,
      goalsAgainst: s.goalAgainst,
      goalDifferential: s.goalDifferential,
      lastTen: `${s.l10Wins}-${s.l10Losses}-${s.l10OtLosses}`,
      streak: s.streakCode ? `${s.streakCode}${s.streakCount ?? ''}` : null,
      clinched: s.clinchIndicator ?? null,
      member: ownerByCode.get(s.teamAbbrev.default) ?? null,
    }))
    .sort((a, b) => a.leagueRank - b.leagueRank);

  // only today's standings say when they were updated; a past season's final table does not
  return { updatedAt: standings.standingsDateTimeUtc ?? null, standings: rows };
};
