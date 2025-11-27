import { CURRENT_SEASON } from '../constants';
import { supabaseAdmin as supabase } from '../supabase';
import { Draft } from './drafts';
import { DraftMembership, getDraftMembershipFromMemberAndDraft } from './draft_memberships';

export type TeamOwnership<T = number> = {
  id: number;
  createdAt: Date;
  draftMembership: T;
  team: number;
};

export const getTeamOwnershipsFromUser = async (userId: string): Promise<TeamOwnership[]> => {
  const { data, error } = await supabase
    .from('team_ownerships')
    .select('*')
    .eq('draftMembership.user', userId)
    .eq('draftMembership.draft.season', CURRENT_SEASON);
  if (error || !data) {
    throw Error(`Cannot fetch team ownerships: ${error.message}`);
  }
  return data;
};

export const getTeamOwnershipsFromDraft = async (
  draft: Draft
): Promise<TeamOwnership<DraftMembership>[]> => {
  const { data, error } = await supabase
    .from('team_ownerships')
    .select(`*,draftMembership:draftMembership(*)`)
    .eq('draftMembership.draft', draft.id);
  if (error || !data) {
    throw Error(`Cannot fetch team ownerships: ${error.message}`);
  }

  // the filtering above will leave draftMembership as null if draft id doesn't match
  // but we will have to manually filter
  const filteredOwnerships = data.filter((ownership) => !!ownership.draftMembership);
  return filteredOwnerships;
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
