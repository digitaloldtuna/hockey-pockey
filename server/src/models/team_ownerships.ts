import { CURRENT_SEASON } from '../constants';
import { supabaseAdmin as supabase } from '../supabase';

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
