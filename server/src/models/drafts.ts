import { nanoid } from 'nanoid';
import { getCurrentSeason } from '../services/env_service';
import { supabaseAdmin as supabase } from '../supabase';
import {
  createDraftMembership,
  getAllMembersForDraft,
  memberBelongsToDraft,
} from './draft_memberships';
import { Profile } from './profiles';

export type Draft = {
  id: number;
  season: number;
  owner: string; // profile id
  code: string;
  members: Profile[];
  createdAt: Date;
};

export const getDraftFromId = async (id: number, memberId?: string) => {
  if (memberId) {
    const canAccess = await memberBelongsToDraft({ draftId: id, memberId });
    if (!canAccess) {
      throw Error('Member cannot access this draft');
    }
  }

  const { data: draft, error } = await supabase.from('drafts').select('*').eq('id', id).single();
  if (error) {
    throw Error(`Error fetching draft: ${error}`);
  }

  const members = await getAllMembersForDraft({ draftId: draft.id });

  return {
    ...draft,
    members,
  };
};

export const createADraft = async ({
  owner,
  name,
}: {
  owner: Profile;
  name: string;
}): Promise<Draft> => {
  const code = nanoid(); // generate random join code for the draft
  const season = await getCurrentSeason();

  console.log(`Creating draft ${name} with owner ${owner.name} (${owner.id}) and code ${code}`);
  const { data, error } = await supabase
    .from('drafts')
    .insert([{ name, season, code, owner: owner.id, status: 'open' }])
    .select()
    .single();

  if (error || !data) {
    throw Error(String(error));
  }

  await createDraftMembership({ memberId: owner.id, draftId: data.id });

  return data;
};

export const joinADraft = async ({
  code,
  memberId,
}: {
  code: string;
  memberId: string;
}): Promise<Draft> => {
  const { data: draft, error } = await supabase
    .from('drafts')
    .select('*')
    .eq('code', code)
    .single();

  if (error) {
    throw Error(`Error fetching draft: ${error}`);
  }

  await createDraftMembership({ draftId: draft.id, memberId });
  return draft;
};

export const getAllDrafts = async ({ profile }: { profile: Profile }) => {
  const { data: draftMemberships, error: dmError } = await supabase
    .from('draft_memberships')
    .select('*')
    .eq('profile', profile.id);

  if (dmError) {
    throw Error(`Error fetching draft memberships: ${dmError}`);
  }

  const draftMembershipIds = draftMemberships.map(
    (membership: { profile: string; draft: number }) => membership.draft
  );

  const { data: drafts, error } = await supabase
    .from('drafts')
    .select('*')
    .in('id', draftMembershipIds);

  if (error) {
    throw Error(`Error fetching drafts: ${error}`);
  }

  const draftsWithMembers = Promise.all(
    drafts.map(async (draft) => {
      const draftId = draft.id;
      const members = await getAllMembersForDraft({ draftId });
      return { ...draft, members };
    })
  );

  return draftsWithMembers;
};

export const closeDraft = async ({ draftId, memberId }: { draftId: number; memberId: string }) => {
  const draft = await getDraftFromId(draftId);
  if (draft.owner !== memberId) {
    throw Error('Member has does not have this permission');
  }

  const { data, error } = await supabase
    .from('drafts')
    .update({ status: 'team_selection' })
    .eq('id', draft.id);

  if (error) {
    throw Error(`Error updating draft: ${error.message}`);
  }

  return data;
};

export const submitDraft = async ({ draftId }: { draftId: number }) => {
  const draft = await getDraftFromId(draftId);
  const { data, error } = await supabase
    .from('drafts')
    .update({ status: 'in_play' })
    .eq('id', draft.id);

  if (error) {
    throw Error(`Error updating draft: ${error.message}`);
  }

  return data;
};
