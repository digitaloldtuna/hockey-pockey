import { Draft } from '../models/drafts';
import { getTeamOwnershipsFromDraft, TeamOwnership } from '../models/team_ownerships';
import { getProfileFromIds, Profile } from '../models/profiles';
import { getGames as getGamesApi } from './nhl_api';
import {
  Game,
  getCompletedGamesForSomeTeams,
  getCompletedGamesForTeams,
  getGames,
  getGamesInTimeFrame,
  updateOrCreateGames,
} from '../models/games';
import { getAllTeamIds, getAllTeams, Team } from '../models/teams';
import _ from 'lodash';
import { DraftMembership } from '../models/draft_memberships';
import { updateEnvVariable } from '../models/env';
import { getApiSeason } from '../utils/mappings';
import { getCurrentSeason } from './env_service';

// WILL ONLY UPDATE FOR CURRENT SEASON
export const refreshGames = async () => {
  const apiSeason = getApiSeason(await getCurrentSeason());

  const gamesFromDB = await getGames({});
  const allGames: Record<number, any> = gamesFromDB.reduce(
    (arr, game) => {
      delete game.lastUpdated;
      arr[game.id] = game;
      return arr;
    },
    {} as Record<number, any>
  );

  const games = await getGamesApi();
  const teamIds = new Set<number>(await getAllTeamIds());
  const gamesToUpdateOrCreate: Game[] = [];

  games.forEach((game) => {
    // reformat date since DB auto adds the 00s
    game.easternStartTime = `${game.easternStartTime}+00:00`;

    if (game.season !== apiSeason) return;
    if (game.gameType !== 2 && game.gameType !== 3 && game.gameType !== 7) return;
    if (!teamIds.has(game.homeTeamId) || !teamIds.has(game.visitingTeamId)) return;
    if (!(game.id in allGames)) {
      gamesToUpdateOrCreate.push(game);
      return;
    }
    if (!_.isEqual(game, allGames[game.id])) gamesToUpdateOrCreate.push(game);
  });

  console.log('amount to update', gamesToUpdateOrCreate.length);
  await updateOrCreateGames(gamesToUpdateOrCreate);
  await updateLastRefreshed();
};

export const getLeaderboard = async (draftId: number) => {
  const teamOwnerships = await getTeamOwnershipsFromDraft(draftId);
  const draftMemberships = teamOwnerships.map((ownership) => ownership.draftMembership);

  const draftMembershipToMember: Record<number, string> = draftMemberships.reduce(
    (arr, membership) => {
      return {
        ...arr,
        [membership.id]: membership.profile.id,
      };
    },
    {}
  );

  const teams: Record<string, Set<number>> = {};
  const teamsSelected = new Set<number>([]);
  const owner: Record<string, string> = {};
  const scores: Record<string, number> = {};

  // populating hashes for faster querying later
  teamOwnerships.forEach((ownership) => {
    const teamOwner = draftMembershipToMember[ownership.draftMembership.id];
    const team = Number(ownership.team.apiId);
    owner[team] = teamOwner;

    if (!(teamOwner in teams)) {
      teams[teamOwner] = new Set([ownership.team.apiId]);
      scores[teamOwner] = 0;
    } else {
      teams[teamOwner].add(ownership.team.apiId);
    }
    teamsSelected.add(ownership.team.apiId);
  });

  // calculating score
  const games = await getGames({});
  games.forEach((game) => {
    const homeTeamId = String(game.homeTeamId);
    const visitingTeamId = String(game.visitingTeamId);

    // if game is not done, continue
    if (game.gameStateId !== 7) return;

    // if one of the team is unassigned, continue
    if (!teamsSelected.has(game.homeTeamId) || !teamsSelected.has(game.visitingTeamId)) return;

    // if home and away have same owner, continue
    if (owner[homeTeamId] === owner[visitingTeamId]) return;

    if (game.homeScore > game.visitingScore) {
      scores[owner[homeTeamId]] += 1;
    } else if (game.homeScore < game.visitingScore) {
      scores[owner[visitingTeamId]] += 1;
    }
  });

  const profiles = await getProfileFromIds(Object.keys(scores));
  const leaderboard = profiles
    .map((profile) => ({ ...profile, score: scores[profile.id] }))
    .sort((a, b) => b.score - a.score);

  return leaderboard;
};

export const getGamesThisWeek = async (draftId: number) => {
  const now = new Date();
  const nowFormatted = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
  }).format(now);

  const end = new Date();
  end.setUTCDate(now.getUTCDate() + 4);
  const endFormatted = end.toISOString().split('T')[0];

  const games = await getGamesInTimeFrame({ start: nowFormatted, end: endFormatted });
  const teamOwnerships = await getTeamOwnershipsFromDraft(draftId);

  const gamesWithAnnotation = await annotateGames(games, teamOwnerships);
  const partitionedGames = partitionGamesByDate(gamesWithAnnotation);

  return partitionedGames;
};

export const getHistory = async (profile: Profile, draft: Draft) => {
  const teamOwnerships = await getTeamOwnershipsFromDraft(draft.id);
  const selectedTeams = teamOwnerships
    .filter((ownership) => ownership.draftMembership.profile.id === profile.id)
    .map((ownership) => ownership.team.apiId);
  const validTeams = teamOwnerships.map((ownership) => ownership.team.apiId);

  const rawGames = await getCompletedGamesForSomeTeams(selectedTeams, validTeams);

  // have to manually remove playing aginst yourself
  const selectedTeamSet = new Set(selectedTeams);
  const filteredGames = rawGames.filter(
    (game) => !(selectedTeamSet.has(game.homeTeamId) && selectedTeamSet.has(game.visitingTeamId))
  );

  const annotatedGames = await annotateGames(filteredGames, teamOwnerships);
  const partitionedGames = partitionGamesByDate(annotatedGames);

  return partitionedGames;
};

export const getStandings = async (draftId: number) => {
  const teamOwnerships = await getTeamOwnershipsFromDraft(draftId);
  const validTeams = teamOwnerships.map((ownership) => ownership.team.apiId);
  const rawGames = await getCompletedGamesForTeams(validTeams);
  const annotatedAndFilteredGames = (await annotateGames(rawGames, teamOwnerships)).filter(
    (game) => !(game.homeMember.id === game.visitingMember.id)
  );
  const games = annotatedAndFilteredGames.sort((a, b) =>
    a.easternStartTime.localeCompare(b.easternStartTime)
  );

  const teams = teamOwnerships.reduce(
    (arr, ownership) => {
      arr[ownership.team.id] = {
        ...ownership.team,
        member: ownership.draftMembership.profile,
        wins: 0,
        loses: 0,
        lt: [],
        streak: { type: 'w', value: 0 },
        win_rate: 0.0,
      };
      return arr;
    },
    {} as Record<string, any>
  );

  games.forEach((game) => {
    const winningTeam = game.homeScore > game.visitingScore ? game.homeTeam : game.visitingTeam;
    const losingTeam = game.homeScore > game.visitingScore ? game.visitingTeam : game.homeTeam;

    const winnerId = String(winningTeam.id);
    const loserId = String(losingTeam.id);

    // logic for winner
    teams[winnerId].wins++;
    if (teams[winnerId].lt.length < 10) {
      teams[winnerId].lt.push(true);
    } else {
      teams[winnerId].lt.pop();
      teams[winnerId].lt.push(true);
    }

    if (teams[winnerId].streak.type === 'w') {
      teams[winnerId].streak.value++;
    } else {
      teams[winnerId].streak.type = 'w';
      teams[winnerId].streak.value = 1;
    }

    // logic for loser
    teams[loserId].loses++;
    if (teams[loserId].lt.length < 10) {
      teams[loserId].lt.push(false);
    } else {
      teams[loserId].lt.pop();
      teams[loserId].lt.push(false);
    }

    if (teams[loserId].streak.type === 'l') {
      teams[loserId].streak.value++;
    } else {
      teams[loserId].streak.type = 'l';
      teams[loserId].streak.value = 1;
    }
  });

  const standings = Object.values(teams).map((team) => {
    return {
      ...team,
      win_rate: Math.trunc((10000 * team.wins) / (team.wins + team.loses)) / 100,
    };
  });

  const sortedStandings = standings.sort((a, b) => {
    if (b.wins !== a.wins) {
      return b.wins - a.wins;
    } else if (b.win_rate !== a.win_rate) {
      return b.win_rate - a.win_rate;
    } else {
      const bltw = b.lt.filter(Boolean).length;
      const altw = a.lt.filter(Boolean).length;
      return bltw - altw;
    }
  });
  return sortedStandings;
};

const annotateGames = async (
  games: Game[],
  teamOwnerships: TeamOwnership<Team, DraftMembership<Profile>>[]
) => {
  const teamsArray = await getAllTeams();
  const teams: Record<string, Team> = teamsArray.reduce(
    (arr, team) => ({
      ...arr,
      [team.apiId]: team,
    }),
    {}
  );

  const teamOwnershipsArray = teamOwnerships;
  const teamOwnership: Record<string, Profile> = teamOwnershipsArray.reduce(
    (arr, teamOwnership) => ({
      ...arr,
      [teamOwnership.team.apiId]: teamOwnership.draftMembership.profile,
    }),
    {}
  );

  const gamesWithAnnotation = await games
    .filter((game) => !!teams[String(game.homeTeamId)] && !!teams[String(game.visitingTeamId)])
    .map((game) => {
      return {
        ...game,
        homeTeam: teams[String(game.homeTeamId)],
        visitingTeam: teams[String(game.visitingTeamId)],
        homeMember: teamOwnership[String(game.homeTeamId)],
        visitingMember: teamOwnership[String(game.visitingTeamId)],
      };
    });

  return gamesWithAnnotation;
};

const partitionGamesByDate = (games: Game[]) => {
  const gamesPartitioned = games.reduce(
    (arr, game) => {
      if (game.gameDate in arr) {
        arr[game.gameDate].push(game);
        return arr;
      }
      arr[game.gameDate] = [game];
      return arr;
    },
    {} as Record<string, Game[]>
  );

  // sort within each bucket
  Object.entries(gamesPartitioned).forEach((entry) => {
    const date = entry[0];
    const games = entry[1];
    gamesPartitioned[date] = games.sort((a: Game, b: Game) =>
      a.easternStartTime.localeCompare(b.easternStartTime)
    );
  });

  // sort based on groups
  const gamesSortedByDate = Object.entries(gamesPartitioned).sort((a, b) => {
    if (a[0] > b[0]) return 1;
    if (a[0] < b[0]) return -1;
    return 0;
  });

  return gamesSortedByDate;
};

const updateLastRefreshed = async () => {
  const now = new Date();
  const estString = now.toLocaleString('en-US', { timeZone: 'America/New_York' });
  const updatedTime = new Date(estString);
  await updateEnvVariable('lastRefreshed', updatedTime);
};
