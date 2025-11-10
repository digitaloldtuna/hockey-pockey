import { CURRENT_SEASON } from '../constants';
import { supabaseAdmin as supabase } from '../supabase';
import { getDraftMembershipFromMemberAndDraft } from './draft_memberships';

export type TeamOwnership = {
  id: number;
  createdAt: Date;
  draftMembership: number; // gives us user and season
  team: number;
};

export const getTeamOwnershipsFromUser = async (userId: string) => {
  const { data, error } = await supabase
    .from('team_ownerships')
    .select('*')
    .eq('draftMembership.user', userId)
    .eq('draftMembership.draft.season', CURRENT_SEASON);
  if (error || !data) {
    throw Error(`Error fetching team ownerships: ${error}`);
  }
  return data;
};

export const createTeamOwnership = async ({
  teamId,
  memberId,
  draftId,
}: {
  teamId: number;
  memberId: string;
  draftId: number;
}) => {
  const draftMembership = await getDraftMembershipFromMemberAndDraft({ memberId, draftId });
  const { data: preexistingOwnership, error: pError } = await supabase
    .from('team_ownerships')
    .select('*')
    .eq('team', teamId)
    .eq('draftMembership', draftMembership.id);

  if ((preexistingOwnership && preexistingOwnership.length > 0) || pError) {
    throw Error(`Membership already exists or ${pError?.message}`);
  }

  const { data: ownership, error } = await supabase
    .from('team_ownerships')
    .insert([{ team: teamId, draftMembership: draftMembership.id }])
    .select()
    .single();

  if (error || !ownership) {
    throw Error(`Error creating team ownerships: ${error}`);
  }
  return ownership;
};
