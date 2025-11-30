import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { ROUTES } from '../constants/routes';
import { Profile, Session } from '../constants/types';
import { toastError } from '../theme/toaster';

interface AuthContextType {
  loading: boolean;
  session: Session | null;
  profile: Profile | null;
  handleSignup: (email: string, password: string, name: string) => Promise<void>;
  handleLogin: (email: string, password: string) => Promise<void>;
  handleLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();

  /**
   * Fetch session exactly once on page load.
   * Axios interceptor will retry /session if a refresh occurs.
   */
  const fetchSession = async () => {
    if (initialized) return;
    setInitialized(true);

    try {
      const res = await api.get('/authentication/session');
      setSession(res.data);
      setProfile(res.data.profile);
    } catch {
      setSession({ authenticated: false });
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  // Run once at mount
  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  /**
   * Signup
   */
  const handleSignup = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      await api.post('/authentication/signup', { email, password, name });
      navigate(ROUTES.LOGIN);
    } catch (err: any) {
      toastError(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login
   * Axios interceptor + session endpoint will pick up tokens.
   */
  const handleLogin = async (email: string, password: string) => {
    try {
      setLoading(true);
      await api.post('/authentication/login', { email, password });

      const sessionRes = await api.get('/authentication/session');
      setSession(sessionRes.data);
      setProfile(sessionRes.data.profile);

      navigate(ROUTES.HOME);
    } catch (err: any) {
      toastError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout
   */
  const handleLogout = async () => {
    try {
      setLoading(true);
      await api.post('/authentication/logout');
    } finally {
      // Always wipe client state
      setSession({ authenticated: false });
      setProfile(null);
      navigate(ROUTES.LOGIN);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        loading,
        session,
        profile,
        handleSignup,
        handleLogin,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthentication() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthentication must be used within an AuthProvider');
  return ctx;
}
