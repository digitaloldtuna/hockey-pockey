import { supabaseAdmin as supabase } from '../supabase';

export interface Team {
  id: string;
  apiId: number;
  franchiseId: number;
  fullName: string;
  code: string;
  leagueId: number;
  divisionName: string;
  conferenceName: string;
  logo?: string;
}

export interface TeamOwnership {
  id: string;
  createdAt: Date;
  userId: string;
  teamId: string;
  season: number;
}

export const getTeamsForUser = async (userId: string): Promise<Team[]> => {
  const { data, error } = await supabase.from('teams').select('*').eq('userId', userId);
  if (error || !data) {
    throw Error(`Error fetching teams: ${error}`);
  }
  return data;
};

export const getTeamFromId = async (teamId: string): Promise<Team> => {
  const { data, error } = await supabase.from('teams').select('*').eq('id', teamId).single();
  if (error || !data) {
    throw Error(`Error fetching team: ${error}`);
  }
  return data;
};
