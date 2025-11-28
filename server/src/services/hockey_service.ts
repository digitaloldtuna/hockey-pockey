import { getDraftFromId } from '../models/drafts';
import { getTeamOwnershipsFromDraft } from '../models/team_ownerships';
import { getProfileFromIds } from '../models/profiles';
import { getGames as getGamesApi } from './nhlApi';
import { Game, getGames, updateOrCreateGames } from '../models/games';
import { getAllTeamIds } from '../models/teams';

// WILL ONLY UPDATE FOR CURRENT SEASON (2026)
export const refreshGames = async () => {
  const games = await getGamesApi();
  const teamIds = new Set<number>(await getAllTeamIds());

  let gamesToUpdateOrCreate: Game[] = [];
  games.forEach((game) => {
    if (game.season !== 20252026) return;
    if (!teamIds.has(game.homeTeamId) || !teamIds.has(game.visitingTeamId)) return;
    gamesToUpdateOrCreate.push(game);
  });

  await updateOrCreateGames(gamesToUpdateOrCreate);
};

export const getLeaderboard = async (draftId: number) => {
  const draft = await getDraftFromId(draftId);
  const teamOwnerships = await getTeamOwnershipsFromDraft(draft);
  const draftMemberships = teamOwnerships.map((ownership) => ownership.draftMembership);

  const draftMembershipToMember: Record<number, string> = draftMemberships.reduce(
    (arr, membership) => {
      return {
        ...arr,
        [membership.id]: membership.profile,
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
    const team = Number(ownership.team);
    owner[team] = teamOwner;

    if (!(teamOwner in teams)) {
      teams[teamOwner] = new Set([ownership.team]);
      scores[teamOwner] = 0;
    } else {
      teams[teamOwner].add(ownership.team);
    }
    teamsSelected.add(ownership.team);
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
