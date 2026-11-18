import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { draftPath, ROUTES } from '../constants/routes';
import { Draft, Profile, Session } from '../constants/types';
import { releaseThisDevice } from '../push';
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
  const navigate = useNavigate();

  const fetchSession = async () => {
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
    /**
     * Fetch session exactly once on page load.
     * Axios interceptor will retry /session if a refresh occurs.
     */
    fetchSession();
  }, []);

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

  // Where to land after logging in: straight into the draft if there is exactly one that isn't
  // closed, otherwise the list of drafts. Only on login, so "All drafts" still reaches the list.
  const landingPage = async () => {
    try {
      const res = await api.get('/draft/all');
      const active = (res.data.drafts as Draft[]).filter((draft) => draft.status !== 'closed');
      return active.length === 1 ? draftPath(active[0].id) : ROUTES.HOME;
    } catch {
      return ROUTES.HOME; // the list page shows its own error if drafts can't be loaded
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
      await fetchSession();
      navigate(await landingPage());
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
      // stop this device getting the account's notifications; needs the login, so it goes first
      await releaseThisDevice();
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
