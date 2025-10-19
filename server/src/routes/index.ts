import express from 'express';
import { supabaseAdmin } from '../supabase';
import { ProfileResponseType } from './types';

const router = express.Router();

router.get('/profile', async (req, res) => {
  const user = req.user;

  console.log('USER:', user);

  if (!user) {
    return res.status(401).json({ error: 'no user' });
  }
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('user', user.id)
    .single();

  if (error) {
    return res.json(401).json({ error: 'something went wrong' });
  }

  const profile: ProfileResponseType = data;
  if (!profile) {
    return res.status(401).json({ error: 'no user' });
  }
  res.json({ profile });
});

export default router;
