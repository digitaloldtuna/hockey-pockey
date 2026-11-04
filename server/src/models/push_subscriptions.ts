import { supabaseAdmin } from '../supabase';

const supabase = supabaseAdmin();

// a person can have a phone, a laptop and so on, but not an unlimited number
export const MAX_SUBSCRIPTIONS_PER_PROFILE = 10;

export interface PushSubscriptionRow {
  id: number;
  profile: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent?: string;
  created_at?: string;
}

// An endpoint identifies one browser on one device. If it is already registered to someone else
// (a shared phone), it moves to whoever subscribed last.
export const saveSubscription = async ({
  profile,
  endpoint,
  p256dh,
  auth,
  userAgent,
}: {
  profile: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
}) => {
  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      { profile, endpoint, p256dh, auth, user_agent: userAgent?.slice(0, 300) },
      { onConflict: 'endpoint' }
    );
  if (error) {
    throw Error(`Cannot save subscription: ${error.message}`);
  }

  // keep only the newest few devices
  const { data: mine, error: listError } = await supabase
    .from('push_subscriptions')
    .select('id')
    .eq('profile', profile)
    .order('created_at', { ascending: false });
  if (listError || !mine) return;
  const extra = mine.slice(MAX_SUBSCRIPTIONS_PER_PROFILE).map((row) => row.id);
  if (extra.length > 0) {
    await supabase.from('push_subscriptions').delete().in('id', extra);
  }
};

// you can only remove your own devices
export const deleteSubscriptionForProfile = async ({
  profile,
  endpoint,
}: {
  profile: string;
  endpoint: string;
}) => {
  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('profile', profile)
    .eq('endpoint', endpoint);
  if (error) {
    throw Error(`Cannot remove subscription: ${error.message}`);
  }
};

// used when the push service says a device is gone for good
export const deleteSubscriptionByEndpoint = async (endpoint: string) => {
  await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
};

export const getSubscriptionsForProfile = async (
  profile: string
): Promise<PushSubscriptionRow[]> => {
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('profile', profile);
  if (error) {
    throw Error(`Cannot fetch subscriptions: ${error.message}`);
  }
  return data ?? [];
};
