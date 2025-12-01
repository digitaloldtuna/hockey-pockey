import { supabaseAdmin } from '../supabase';
import { Request, Response, NextFunction } from 'express';

const supabase = supabaseAdmin();

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.cookies.access_token;

  if (!accessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid session' });
  }

  req.user = user;
  next();
};
