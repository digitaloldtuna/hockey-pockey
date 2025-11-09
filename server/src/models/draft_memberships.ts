import { supabaseAdmin as supabase } from '../supabase';
import { getProfileFromId } from './profiles';
import { getDraftFromId } from './drafts';

export type DraftMemberships = {
  id: number;
  user: string;
  draft: number;
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
