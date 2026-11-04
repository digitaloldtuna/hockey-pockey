import { supabaseAdmin } from '../supabase';

const supabase = supabaseAdmin();

export type NotificationClaim = {
  profile: string;
  draft: number;
  game_id: number;
  kind: 'result';
};

// Try to record that these notifications are being sent. Rows that already exist are ignored, and
// only the rows that were newly recorded come back. Recording happens before sending, so two runs
// that overlap cannot both send the same message.
export const claimNotifications = async (
  claims: NotificationClaim[]
): Promise<NotificationClaim[]> => {
  if (claims.length === 0) return [];
  const { data, error } = await supabase
    .from('notification_log')
    .upsert(claims, { onConflict: 'profile,draft,game_id,kind', ignoreDuplicates: true })
    .select('profile,draft,game_id,kind');
  if (error) {
    throw Error(`Cannot record notifications: ${error.message}`);
  }
  return (data ?? []) as NotificationClaim[];
};

// which of these were already sent (used by the dry run, which records nothing)
export const findClaimed = async (claims: NotificationClaim[]): Promise<Set<string>> => {
  const found = new Set<string>();
  if (claims.length === 0) return found;
  const { data, error } = await supabase
    .from('notification_log')
    .select('profile,draft,game_id,kind')
    .in('game_id', Array.from(new Set(claims.map((claim) => claim.game_id))));
  if (error) {
    throw Error(`Cannot read notification log: ${error.message}`);
  }
  (data ?? []).forEach((row) =>
    found.add(`${row.profile}|${row.draft}|${row.game_id}|${row.kind}`)
  );
  return found;
};

export const claimKey = (claim: NotificationClaim) =>
  `${claim.profile}|${claim.draft}|${claim.game_id}|${claim.kind}`;
