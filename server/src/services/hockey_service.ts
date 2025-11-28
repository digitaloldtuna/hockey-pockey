import { getDraftFromId } from '../models/drafts';
import { getTeamOwnershipsFromDraft } from '../models/team_ownerships';
import { getProfileFromIds, Profile } from '../models/profiles';
import { getGames as getGamesApi } from './nhl_api';
import { Game, getGames, getGamesInTimeFrame, updateOrCreateGames } from '../models/games';
import { getAllTeamIds, getAllTeams, Team } from '../models/teams';
import _ from 'lodash';

// WILL ONLY UPDATE FOR CURRENT SEASON (2026)
export const refreshGames = async () => {
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

    if (game.season !== 20252026) return;
    if (!teamIds.has(game.homeTeamId) || !teamIds.has(game.visitingTeamId)) return;
    if (!(game.id in allGames)) {
      gamesToUpdateOrCreate.push(game);
      return;
    }
    if (!_.isEqual(game, allGames[game.id])) gamesToUpdateOrCreate.push(game);
  });

  console.log('amount to update', gamesToUpdateOrCreate.length);
  await updateOrCreateGames(gamesToUpdateOrCreate);
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
  const nowFormatted = now.toISOString().split('T')[0];

  const end = new Date(now);
  end.setUTCDate(now.getUTCDate() + 3);
  const endFormatted = end.toISOString().split('T')[0];

  const games = await getGamesInTimeFrame({ start: nowFormatted, end: endFormatted });

  const teamsArray = await getAllTeams();
  const teams: Record<string, Team> = teamsArray.reduce(
    (arr, team) => ({
      ...arr,
      [team.apiId]: team,
    }),
    {}
  );

  const teamOwnershipsArray = await getTeamOwnershipsFromDraft(draftId);
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

  const gamesPartitioned = gamesWithAnnotation.reduce(
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
