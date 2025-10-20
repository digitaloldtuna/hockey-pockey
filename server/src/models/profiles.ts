import { CURRENT_SEASON } from '../constants';
import { supabaseAdmin as supabase } from '../supabase';
import { getTeamFromId } from './teams';

export interface Profile {
  id: string;
  name: string;
  createdAt: Date;
  userId: string;
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
    .insert([{ user_id: userId, name, email }])
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
    throw Error(`Error fetching profile: ${error}`);
  }
  return data;
};

export const getProfileFromUserId = async (user_id: string): Promise<Profile> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user_id)
    .single();
  if (error) {
    throw Error(`Error fetching profile: ${error}`);
  }
  return data;
};

export const selectTeam = async ({
  userId,
  teamId,
}: {
  userId: string;
  teamId: string;
}): Promise<void> => {
  // checking user and team exists
  await getProfileFromId(userId);
  await getTeamFromId(teamId);

  // check if user has already selected team
  const { data } = await supabase
    .from('team_ownership')
    .select('userId, teamId')
    .eq('userId', userId)
    .eq('teamId', teamId);
  if (data) {
    throw Error('User has already selected this team');
  }

  await supabase.from('team_ownerships').insert([{ season: CURRENT_SEASON, userId, teamId }]);
};
