import express from 'express';
import { createProfile, getProfileFromUserId } from '../models/profiles';
import { createUser, getUser, loginWithCredentials } from '../models/users';

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
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
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
});

router.get('/session', async (req, res) => {
  const token = req.cookies?.access_token;
  if (!token) return res.status(401).json({ authenticated: false });

  let user, profile;
  try {
    user = await getUser(token);
    profile = await getProfileFromUserId(user.id);
  } catch (err) {
    return res.status(401).json({ authenticated: false });
  }

  return res.json({ authenticated: true, user, profile });
});

router.post('/logout', (req, res) => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  res.json({ message: 'Logged out' });
});

export default router;
