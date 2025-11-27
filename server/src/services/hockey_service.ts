import { getDraftFromId } from '../models/drafts';
import { getTeamOwnershipsFromDraft } from '../models/team_ownerships';
import { getGames } from '../models/games';
import { getProfileFromId, getProfileFromIds } from '../models/profiles';

export const refreshGames = () => {};

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
