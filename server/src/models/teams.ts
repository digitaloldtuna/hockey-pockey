import { supabaseAdmin as supabase } from '../supabase';
import { getTeamOwnershipsFromUser } from './team_ownerships';

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
  user: string;
  team: string;
  season: number;
}

export const getTeamsForUser = async (userId: string): Promise<Team[]> => {
  const teamOwnerships = await getTeamOwnershipsFromUser(userId);
  const teamIds = teamOwnerships.map((ownership) => ownership.teamId);

  const { data, error } = await supabase.from('teams').select('*').in('id', teamIds);
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

// export const getScoreForTeam = async
