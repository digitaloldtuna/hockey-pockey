import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { ROUTES } from '../constants/routes';
import { Profile, Session } from '../constants/types';

interface AuthContextType {
  loading: boolean;
  session: Session | null;
  profile: Profile | null;
  handleSignup: (email: string, password: string, name: string) => void;
  handleLogin: (email: string, password: string) => Promise<void>;
  handleLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchSession() {
      setLoading(true);
      api
        .get('/authentication/session')
        .then((res) => {
          setSession(res.data);
          setProfile(res.data.profile);
          setLoading(false);
        })
        .catch(() => {
          setSession({ authenticated: false });
          setLoading(false);
        });
    }
    fetchSession();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      setLoading(true);
      await api.post('/authentication/login', { email, password }, { withCredentials: true });
      const { data } = await api.get<{ profile: Profile }>('/profile');
      if (data.profile) {
        setProfile(data.profile);
      }
      navigate(ROUTES.HOME);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err.response?.data?.error || 'Login failed');
    }
    setLoading(false);
  };

  const handleSignup = (email: string, password: string, name: string) => {
    try {
      api.post('/authentication/signup', { email, password, name });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err.response?.data?.error || 'Signup failed');
    }
  };

  const handleLogout = () => {
    setLoading(true);
    api
      .post('/authentication/logout')
      .then((res) => {
        setProfile(null);
        navigate('/login');
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthentication must be used within an AuthProvider');
  return context;
}
