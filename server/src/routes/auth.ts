import express from 'express';
import { supabaseAdmin, supabaseClient } from '../supabase';

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;

  // Basic validation
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required.' });
  }

  try {
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Send confirmation email
    });

    if (userError) {
      return res.status(400).json({ error: userError.message });
    }

    if (!user?.id) {
      return res.status(400).json({ error: 'Error creating user.' });
    }

    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert([{ user: user.id, name }]);

    if (profileError) {
      return res.status(400).json({ error: profileError.message });
    }

    return res.status(201).json({ profile: profileData });
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

  const { access_token, refresh_token, expires_in } = data.session;

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

  const {
    data: { user },
    error,
  } = await supabaseClient.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ authenticated: false });
  }

  res.json({ authenticated: true });
});

router.post('/logout', (req, res) => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  res.json({ message: 'Logged out' });
});

export default router;
