import { getCurrentSeason } from '../services/env_service';
import { supabaseAdmin as supabase } from '../supabase';
import { DraftMembership, getDraftMembershipFromMemberAndDraft } from './draft_memberships';
import { Profile } from './profiles';
import { Team } from './teams';

export type TeamOwnership<TeamType = number, DraftType = number> = {
  id: number;
  createdAt: Date;
  draftMembership: DraftType;
  team: TeamType;
};

export const getTeamOwnershipsFromUser = async (userId: string): Promise<TeamOwnership[]> => {
  const season = await getCurrentSeason();

  const { data, error } = await supabase
    .from('team_ownerships')
    .select('*')
    .eq('draftMembership.user', userId)
    .eq('draftMembership.draft.season', season);
  if (error || !data) {
    throw Error(`Cannot fetch team ownerships: ${error.message}`);
  }
  return data;
};

export const getTeamOwnershipsFromDraft = async (
  draftId: number
): Promise<TeamOwnership<Team, DraftMembership<Profile>>[]> => {
  const { data, error } = await supabase
    .from('team_ownerships')
    .select(`*,draftMembership:draftMembership(*,profile:profile(*)),team:team(*)`)
    .eq('draftMembership.draft', draftId);
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
