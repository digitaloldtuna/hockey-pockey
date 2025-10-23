import { supabaseAdmin as supabase } from '../supabase';
import { CURRENT_SEASON } from '../constants';

export type DraftMemberships = {
  id: number;
  user: string;
  draft: number;
};
