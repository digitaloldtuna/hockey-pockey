import { useCallback, useEffect, useState } from 'react';
import { disablePush, enablePush, getPushStatus, PushStatus, sendTestPush } from '../push';
import { toastError, toastSuccess } from '../theme/toaster';

export function usePushNotifications() {
  const [status, setStatus] = useState<PushStatus>('loading');
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setStatus(await getPushStatus());
    } catch {
      setStatus('unsupported');
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const run = async (action: () => Promise<void>, failure: string) => {
    setBusy(true);
    try {
      await action();
    } catch (error) {
      toastError(failure, error instanceof Error ? error.message : undefined);
    } finally {
      await refresh();
      setBusy(false);
    }
  };

  return {
    status,
    busy,
    enable: () =>
      run(async () => {
        await enablePush();
        toastSuccess('Notifications are on for this device.');
      }, 'Could not turn on notifications'),
    disable: () => run(disablePush, 'Could not turn off notifications'),
    test: () =>
      run(async () => {
        const result = await sendTestPush();
        if (result.sent > 0) {
          toastSuccess(
            "If nothing shows up, check this device's notification settings for your browser, and that Do Not Disturb is off.",
            `Sent to ${result.sent} ${result.sent === 1 ? 'device' : 'devices'}`
          );
        } else if (result.devices === 0) {
          throw new Error(
            'No device is registered for your account. Turn notifications off and on again.'
          );
        } else if (result.removed > 0) {
          throw new Error(
            'This device was no longer registered with the push service. Turn notifications off and on again.'
          );
        } else {
          const codes =
            result.failureCodes.length > 0 ? ` (code ${result.failureCodes.join(', ')})` : '';
          throw new Error(`The push service rejected the message${codes}. Check the server's log.`);
        }
      }, 'Could not send a test notification'),
  };
}
