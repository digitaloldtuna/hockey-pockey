import express, { NextFunction, Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import { getProfileFromUserId } from '../models/profiles';
import { deleteSubscriptionForProfile, saveSubscription } from '../models/push_subscriptions';
import {
  getPublicKey,
  isAllowedEndpoint,
  isPushConfigured,
  parseSubscription,
  sendToProfile,
} from '../services/notification_service';

const router = express.Router();

const limit = (max: number, windowMinutes: number) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit: max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, try again later' },
  });

// Changes must come from this site itself and be sent as JSON. Together with the lax cookies this
// stops another website from quietly signing a logged-in user up to someone else's device.
const sameSiteJson = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV !== 'development') {
    const origin = req.get('origin');
    if (origin) {
      let host = '';
      try {
        host = new URL(origin).host;
      } catch {
        return res.status(403).json({ error: 'Bad origin' });
      }
      if (host !== req.get('host')) {
        return res.status(403).json({ error: 'Bad origin' });
      }
    }
  }
  if (!req.is('application/json')) {
    return res.status(415).json({ error: 'Send JSON' });
  }
  next();
};

router.use(limit(120, 15));

// Never let a browser or proxy reuse an earlier answer. A repeated request that came back as a bare
// "304 not modified" made the page reuse a stale copy that had no push key in it.
router.use((_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

router.get('/public-key', (_req, res) => {
  const key = getPublicKey();
  if (!key || !isPushConfigured()) {
    return res.status(503).json({ error: 'Notifications are not set up' });
  }
  return res.json({ key });
});

router.post('/subscribe', sameSiteJson, async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'User is not authenticated' });

    const subscription = parseSubscription(req.body);
    if (!subscription) return res.status(400).json({ error: 'Invalid subscription' });

    // the owner always comes from the login, never from the request
    const profile = await getProfileFromUserId(user.id);
    await saveSubscription({
      profile: profile.id,
      ...subscription,
      userAgent: req.get('user-agent') ?? undefined,
    });
    return res.json({ subscribed: true });
  } catch (e) {
    console.error(e);
    return res.status(400).json({ error: 'Could not subscribe' });
  }
});

router.post('/unsubscribe', sameSiteJson, async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'User is not authenticated' });

    const endpoint = req.body?.endpoint;
    if (!isAllowedEndpoint(endpoint)) return res.status(400).json({ error: 'Invalid endpoint' });

    const profile = await getProfileFromUserId(user.id);
    await deleteSubscriptionForProfile({ profile: profile.id, endpoint });
    return res.json({ subscribed: false });
  } catch (e) {
    console.error(e);
    return res.status(400).json({ error: 'Could not unsubscribe' });
  }
});

// sends a test notification to your own devices only
// 20 an hour is plenty for trying it out and still stops anyone flooding their own devices
router.post('/test', limit(20, 60), sameSiteJson, async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'User is not authenticated' });

    const profile = await getProfileFromUserId(user.id);
    const result = await sendToProfile(profile.id, {
      title: '🎉 Hockey Pockey: notifications are on!',
      body: "This is a test. You'll get a message like this when your teams win or lose.",
      tag: `test-${Date.now()}`, // new each time, so a repeat is never swallowed as a replacement
      url: '/',
    });
    return res.json(result);
  } catch (e) {
    console.error(e);
    return res.status(400).json({ error: 'Could not send the test notification' });
  }
});

export default router;
