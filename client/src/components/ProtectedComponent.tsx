import api from '../api';
import { JSX, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

async function checkSession() {
  try {
    const res = await api.get('/authentication/session');
    if (res.status === 200 && res.data.authenticated) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function ProtectedComponent({ children }: { children: JSX.Element }) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  checkSession().then((authenticated) => {
    setLoading(false);
    if (!authenticated) {
      navigate(ROUTES.LOGIN);
    }
  });

  if (loading) return <div>Loading...</div>;

  return children;
}
