import express from 'express';
import { supabaseAdmin, supabaseClient } from '../supabase';

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Send confirmation email
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({ user: data.user });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.cookie('access_token', data.session.access_token, {
    httpOnly: true,
    secure: true, // use false if testing over HTTP
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
  });

  res.json({ message: 'Logged in' });
});

router.get('/session', async (req, res) => {
  const token = req.cookies?.get['access_token'];
  if (!token) return res.status(401).json({ authenticated: false });

  const {
    data: { user },
    error,
  } = await supabaseClient.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ authenticated: false });
  }

  res.json({ authenticated: true, user });
});

router.post('/logout', (req, res) => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  res.json({ message: 'Logged out' });
});

export default router;
