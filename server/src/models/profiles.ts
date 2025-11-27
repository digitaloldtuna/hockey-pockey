import { CURRENT_SEASON } from '../constants';
import { supabaseAdmin as supabase } from '../supabase';
import { getTeamFromId } from './teams';

export interface Profile {
  id: string;
  name: string;
  createdAt: Date;
  user: string;
}

export const createProfile = async ({
  userId,
  email,
  name,
}: {
  userId: string;
  email: string;
  name: string;
}): Promise<Profile> => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([{ user: userId, name, email }])
    .select()
    .single();
  if (error) {
    throw Error(`Error creating profile: ${error}`);
  }
  return data;
};

export const getProfileFromId = async (id: string): Promise<Profile> => {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
  if (error) {
    throw Error(`Cannot fetch profiles: ${error}`);
  }
  return data;
};

export const getProfileFromIds = async (ids: string[]): Promise<Profile[]> => {
  const { data, error } = await supabase.from('profiles').select('*').in('id', ids);
  if (error) {
    throw Error(`Cannot fetch profiles: ${error}`);
  }
  return data;
};

export const getProfileFromUserId = async (userId: string): Promise<Profile> => {
  const { data, error } = await supabase.from('profiles').select('*').eq('user', userId).single();
  if (error) {
    throw Error(`Cannot fetch profiles: ${error}`);
  }
  return data;
};

export const updateProfile = async ({
  userId,
  profile,
}: {
  userId: string;
  profile: Profile;
}): Promise<Profile> => {
  const oldProfile = await getProfileFromUserId(userId);

  const { data, error } = await supabase
    .from('profiles')
    .update({ name: profile.name })
    .eq('id', oldProfile.id)
    .select()
    .single();

  if (error) {
    throw Error(`Error updating profile ${error.message}`);
  }

  return data;
};
