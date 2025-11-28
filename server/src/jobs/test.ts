/* eslint-disable */
import { getStandingsNow, getTeams } from '../services/nhl_api';
import { supabaseAdmin as supabase } from '../supabase';

export const TestSupabase = async (query: string) => {
  try {
    console.log(await supabase.from('draft_memberships').select(`*,${query}`).in('id', [1]));
  } catch (e) {
    console.log('Error:', e);
  }
};
