import { nanoid } from 'nanoid';
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
  const code = nanoid();

  console.log(`Creating draft ${name} with owner ${owner.name} (${owner.id}) and code ${code}`);
  const { data, error } = await supabase
    .from('drafts')
    .insert([{ name, season: 2026, code, owner: owner.id, status: 'open' }])
    .select()
    .single();

  if (error || !data) {
    throw Error(String(error));
  }

  await createDraftMembership({ memberId: owner.id, draftId: data.id });

  return data;
};

export const joinADraft = async (): Promise<Draft | null> => {
  return null;
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
