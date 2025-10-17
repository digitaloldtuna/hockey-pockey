import { supabaseAdmin } from '../supabase';
import { Request, Response, NextFunction } from 'express';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  console.log('within authenticate');

  let accessToken = req.cookies.get['access_token'];
  const refreshToken = req.cookies.get['refresh_token'];

  if (!accessToken && !refreshToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Try to get user from access token
  let {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(accessToken);

  // If access token is expired or invalid, try refreshing
  if (error && refreshToken) {
    const { data, error: refreshError } = await supabaseAdmin.auth.setSession({
      access_token: '',
      refresh_token: refreshToken,
    });

    if (refreshError || !data?.session) {
      return res.status(401).json({ error: 'Session expired' });
    }

    // Update tokens in cookies
    accessToken = data.session.access_token;
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60, // 1 hour
    });

    res.cookie('refresh_token', data.session.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    });

    user = data.user;
  }

  if (!user) return res.status(401).json({ error: 'Invalid session' });
  (req as any).user = user;
  next();
};
