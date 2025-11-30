import { supabaseAdmin } from '../supabase';
import { Request, Response, NextFunction } from 'express';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.cookies.access_token;

  if (!accessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(accessToken);

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid session' });
  }

  req.user = user;
  next();
};
