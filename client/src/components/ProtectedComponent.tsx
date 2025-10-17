import api from '../api';
import { JSX, useState } from 'react';
import { useNavigate } from 'react-router-dom';

async function checkSession() {
  try {
    const res = await api.get('/authentication/session');
    if (res.status === 200) {
      const { user } = await res.data;
      return user;
    }
    return null;
  } catch (e) {
    return null;
  }
}

export function ProtectedComponent({ children }: { children: JSX.Element }) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  checkSession().then((user) => {
    setLoading(false);
    if (!user) {
      navigate('/login');
    }
  });

  if (loading) return <div>Loading...</div>;

  return children;
}
