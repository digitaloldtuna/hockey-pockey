import webpush from 'web-push';
import {
  deleteSubscriptionByEndpoint,
  getSubscriptionsForProfile,
} from '../models/push_subscriptions';

export type PushPayload = {
  title: string;
  body: string;
  tag: string; // a repeat with the same tag replaces the earlier notification
  url: string; // an in-app path such as /draft/3
};

// The only places a browser's push address can legitimately point. Anything else is refused, so
// the server can never be talked into sending requests to an address someone made up.
const PUSH_HOSTS = [
  /(^|\.)fcm\.googleapis\.com$/, // Chrome, Edge and Android
  /(^|\.)push\.services\.mozilla\.com$/, // Firefox
  /(^|\.)push\.apple\.com$/, // Safari and iPhone
  /(^|\.)notify\.windows\.com$/, // Windows
];

export const isAllowedEndpoint = (endpoint: unknown): endpoint is string => {
  if (typeof endpoint !== 'string' || endpoint.length > 2048) return false;
  try {
    const url = new URL(endpoint);
    return (
      url.protocol === 'https:' &&
      url.port === '' &&
      !url.username &&
      !url.password &&
      PUSH_HOSTS.some((host) => host.test(url.hostname))
    );
  } catch {
    return false;
  }
};

// base64url text of a sensible length
const isKey = (value: unknown, max: number): value is string =>
  typeof value === 'string' &&
  value.length > 10 &&
  value.length <= max &&
  /^[A-Za-z0-9_-]+=*$/.test(value);

type SubscriptionBody = {
  subscription?: { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };
};

export const parseSubscription = (body: unknown) => {
  const subscription = (body as SubscriptionBody | undefined)?.subscription;
  const endpoint = subscription?.endpoint;
  const p256dh = subscription?.keys?.p256dh;
  const auth = subscription?.keys?.auth;
  if (!isAllowedEndpoint(endpoint) || !isKey(p256dh, 200) || !isKey(auth, 100)) {
    return null;
  }
  return { endpoint, p256dh, auth };
};

let configured = false;

export const isPushConfigured = () =>
  !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT);

const configure = () => {
  if (configured) return;
  if (!isPushConfigured()) {
    throw Error(
      'Push is not configured: set VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY and VAPID_SUBJECT'
    );
  }
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT as string,
    process.env.VAPID_PUBLIC_KEY as string,
    process.env.VAPID_PRIVATE_KEY as string
  );
  configured = true;
};

export const getPublicKey = () => process.env.VAPID_PUBLIC_KEY ?? null;

export type SendResult = {
  devices: number; // how many devices the person has registered
  sent: number; // accepted by the push service
  removed: number; // reported as gone and deleted
  failed: number; // rejected for some other reason
  failureCodes: number[]; // the push service's status codes for those, to help work out why
};

// Send to every device a person has registered. Devices the push service reports as gone are removed.
export const sendToProfile = async (
  profileId: string,
  payload: PushPayload
): Promise<SendResult> => {
  configure();
  const subscriptions = await getSubscriptionsForProfile(profileId);
  const result: SendResult = {
    devices: subscriptions.length,
    sent: 0,
    removed: 0,
    failed: 0,
    failureCodes: [],
  };

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        const response = await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          },
          JSON.stringify(payload),
          { TTL: 6 * 60 * 60, urgency: 'normal' } // a score older than six hours is not worth delivering
        );
        result.sent += 1;
        // which push service took it, and what it said (the address after the host is a secret, so only the host)
        console.log(
          `push accepted by ${new URL(subscription.endpoint).host}, status ${response.statusCode}`
        );
      } catch (caught) {
        const error = caught as { statusCode?: number; body?: string; message?: string };
        if (error.statusCode === 404 || error.statusCode === 410) {
          await deleteSubscriptionByEndpoint(subscription.endpoint);
          result.removed += 1;
        } else {
          console.error('push failed:', error.statusCode, error.body ?? error.message);
          result.failed += 1;
          if (error.statusCode) result.failureCodes.push(error.statusCode);
        }
      }
    })
  );

  return result;
};
