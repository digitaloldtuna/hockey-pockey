import axios from 'axios';
import api from './api';

// What this device can do about notifications, and the actions to turn them on and off.

export type PushStatus =
  | 'loading'
  | 'unsupported' // this browser cannot receive pushes at all
  | 'needs-install' // iPhone: only works once added to the Home Screen
  | 'blocked' // the person said no in the browser
  | 'off'
  | 'on';

export const isIos = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

const canPush = () =>
  'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

const getRegistration = async () => {
  const registration = await navigator.serviceWorker.getRegistration();
  return registration ?? navigator.serviceWorker.ready;
};

const getSubscription = async () => {
  const registration = await getRegistration();
  return registration.pushManager.getSubscription();
};

export const getPushStatus = async (): Promise<PushStatus> => {
  // iPhone only exposes push to apps opened from the Home Screen
  if (isIos() && !isStandalone()) return 'needs-install';
  if (!canPush()) return 'unsupported';
  if (Notification.permission === 'denied') return 'blocked';
  return (await getSubscription()) ? 'on' : 'off';
};

// the server's key comes as base64url text; the browser wants bytes
const keyToBytes = (key: string) => {
  const padded = (key + '='.repeat((4 - (key.length % 4)) % 4))
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const raw = window.atob(padded);
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
};

// Asks the server for the key the browser needs to subscribe, and explains clearly if it can't.
const fetchPublicKey = async (): Promise<string> => {
  let key: unknown;
  try {
    key = (await api.get('/push/public-key')).data?.key;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 503) {
      throw new Error(
        'Notifications are not set up on the server yet (the push keys are missing).'
      );
    }
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new Error(
        'The server does not have the notification routes yet. It needs the latest code.'
      );
    }
    throw error;
  }
  if (typeof key !== 'string' || key.length < 20) {
    // an older server answers unknown paths with the web page instead of a key
    throw new Error(
      'The server did not send a push key. It may need restarting with the latest code.'
    );
  }
  return key;
};

// Must be called from a tap or click, because the browser only shows its permission prompt then.
export const enablePush = async () => {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Notifications were not allowed');

  const key = await fetchPublicKey();
  const registration = await getRegistration();
  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: keyToBytes(key),
    }));

  try {
    await api.post('/push/subscribe', { subscription: subscription.toJSON() });
  } catch (error) {
    // do not leave the browser subscribed to something the server does not know about
    await subscription.unsubscribe();
    throw error;
  }
};

export const disablePush = async () => {
  const subscription = await getSubscription();
  if (!subscription) return;
  await api.post('/push/unsubscribe', { endpoint: subscription.endpoint });
  await subscription.unsubscribe();
};

// Called when someone logs out, so a shared phone does not keep getting their notifications.
export const releaseThisDevice = async () => {
  try {
    if (!canPush()) return;
    await disablePush();
  } catch {
    // logging out must never be blocked by this
  }
};

export type TestResult = {
  devices: number;
  sent: number;
  removed: number;
  failed: number;
  failureCodes: number[];
};

export const sendTestPush = async (): Promise<TestResult> => {
  try {
    const { data } = await api.post('/push/test', {});
    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 429) {
      throw new Error('That is too many tests in a short time. Wait a few minutes and try again.');
    }
    throw error;
  }
};
