import { getDraftFromId, submitDraft } from '../models/drafts';
import { Profile } from '../models/profiles';
import { createTeamOwnership } from '../models/team_ownerships';

export const submitAndStartDraft = async ({
  profile,
  draftId,
  teamAssignments,
}: {
  profile: Profile;
  draftId: number;
  teamAssignments: { teamId: number; memberId: string }[];
}) => {
  const draft = await getDraftFromId(draftId);
  if (draft.owner !== profile.id) {
    throw Error('User does not have permissions');
  }

  Promise.all(
    teamAssignments.map(async (assignment) => {
      if (!assignment.memberId) {
        return;
      }

      await createTeamOwnership({
        draftId,
        teamId: assignment.teamId,
        memberId: assignment.memberId,
      });
    })
  );

  await submitDraft({ draftId });
};
