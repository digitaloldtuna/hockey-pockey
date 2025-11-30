import express from 'express';
import { createProfile, getProfileFromUserId } from '../models/profiles';
import { createUser, getUser, loginWithCredentials, refreshAccessToken } from '../models/users';

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;

  // Basic validation
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required.' });
  }

  try {
    const user = await createUser({ email, password });
    const profile = await createProfile({ userId: user.id, name, email });

    return res.status(201).json({ profile });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: err || 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const session = await loginWithCredentials({ email, password });
    const { access_token, refresh_token, expires_in } = session;

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expires_in * 1000, // expires_in is in seconds
    });

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 * 1000, // 30 days
    });

    res.json({ message: 'Logged in' });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/session', async (req, res) => {
  const access: string = req.cookies?.access_token;
  const refresh = req.cookies?.refresh_token;

  if (!refresh) return res.status(401).json({ authenticated: false });

  try {
    const user = await getUser(access);
    console.log('Parsed user', user);
    const profile = await getProfileFromUserId(user.id);
    return res.json({ authenticated: true, user, profile });
  } catch (err) {
    if (!refresh) {
      return res.status(401).json({ authenticated: false });
    }

    try {
      const { access_token, expires_in } = await refreshAccessToken(refresh);

      // set new access token cookie
      res.cookie('access_token', access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: expires_in * 1000,
      });

      // now fetch profile with new token
      const user = await getUser(access_token);
      const profile = await getProfileFromUserId(user.id);

      return res.json({ authenticated: true, user, profile });
    } catch (refreshErr) {
      console.error('Session error:', refreshErr);
      return res.status(401).json({ authenticated: false });
    }
  }
});

router.post('/refresh', async (req, res) => {
  const refresh_token = req.cookies?.refresh_token;

  if (!refresh_token) {
    return res.status(401).json({ error: 'No refresh token' });
  }

  try {
    const { access_token, expires_in } = await refreshAccessToken(refresh_token);

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expires_in * 1000,
    });

    return res.json({ message: 'Token refreshed' });
  } catch (err) {
    console.error('Refresh error:', err);
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  res.json({ message: 'Logged out' });
});

export default router;
