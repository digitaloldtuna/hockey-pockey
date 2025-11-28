import { supabaseAdmin as supabase } from '../supabase';
import { getProfileFromId, Profile } from './profiles';
import { Draft, getDraftFromId } from './drafts';

export type DraftMembership<T = string> = {
  id: number;
  profile: T;
  draft: number;
};

export const getDraftMembershipFromMemberAndDraft = async ({
  memberId,
  draftId,
}: {
  memberId: string;
  draftId: number;
}) => {
  const { data, error } = await supabase
    .from('draft_memberships')
    .select('*')
    .eq('profile', memberId)
    .eq('draft', draftId)
    .single();

  if (error) {
    throw Error(`Error finding draft membership: ${error.message}`);
  }

  return data;
};

export const getDraftMembershipsFromIds = async (ids: number[]): Promise<DraftMembership[]> => {
  console.log('IDS', ids);
  const { data, error } = (await supabase
    .from('draft_memberships')
    .select('*,profile:profiles!profile(*)')
    .in('id', ids)) as {
    data: DraftMembership[] | null;
    error: any;
  };
  if (error || !data) {
    throw Error(`Error finding draft membership: ${error.message}`);
  }
  return data;
};

export const createDraftMembership = async ({
  draftId,
  memberId,
}: {
  draftId: number;
  memberId: string;
}) => {
  console.log(`Adding member ${memberId} to draft ${draftId}`);

  // checking that ids are valid
  const profile = await getProfileFromId(memberId);
  const draft = await getDraftFromId(draftId);

  const { data: membership, error: mError } = await supabase
    .from('draft_memberships')
    .select('*')
    .eq('profile', profile.id)
    .eq('draft', draft.id);

  if (mError) {
    throw Error(`Error checking if membership already exists: ${mError}`);
  }

  if (membership.length > 0) {
    return; // membership already exists
  }

  const { data, error } = await supabase
    .from('draft_memberships')
    .insert([{ profile: profile.id, draft: draft.id }])
    .select()
    .single();

  if (!data || error) {
    throw Error(`Error adding member to draft: ${error}`);
  }

  console.log('Successfully added member');
};

export const deleteDraftMembership = async ({
  draftId,
  memberId,
}: {
  draftId: number;
  memberId: string;
}) => {
  console.log(`Deleting member ${memberId} from draft ${draftId}`);

  // checking that ids are valid
  const profile = await getProfileFromId(memberId);
  const draft = await getDraftFromId(draftId);

  const { data: memberships, error: mError } = await supabase
    .from('draft_memberships')
    .select('*')
    .eq('profile', profile.id)
    .eq('draft', draft.id);

  if (mError) {
    throw Error(`Error checking if membership already exists: ${mError}`);
  }

  if (memberships.length === 0) {
    return; // member is not in draft
  }

  const membership = memberships[0];
  const { error } = await supabase.from('draft_memberships').delete().eq('id', membership.id);
  if (error) {
    throw Error(`Error removing member to draft: ${error}`);
  }

  console.log('Successfully removed member');
};

export const memberBelongsToDraft = async ({
  draftId,
  memberId,
}: {
  draftId: number;
  memberId: string;
}) => {
  const { data: membership, error } = await supabase
    .from('draft_memberships')
    .select('*')
    .eq('draft', draftId)
    .eq('profile', memberId);

  if (error) {
    throw Error(`Error checking if member belongs to draft: ${error.message}`);
  }

  return membership.length > 0;
};

export const getAllMembersForDraft = async ({ draftId }: { draftId: number }) => {
  const { data: allDraftMemberships, error: dmError } = await supabase
    .from('draft_memberships')
    .select('*')
    .eq('draft', draftId);

  if (dmError) {
    throw Error('Error fetching members for draft');
  }

  const memberIds = allDraftMemberships.map((membership) => membership.profile);

  const { data: profiles, error: pError } = await supabase
    .from('profiles')
    .select('*')
    .in('id', memberIds);

  if (pError) {
    throw Error(`Error fetching profiles for draft: ${pError.message}`);
  }

  return profiles;
};
