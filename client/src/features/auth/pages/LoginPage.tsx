import { useState } from 'react';
import api from '../../../api';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';

const LoginPage = () => {
  console.log('in login page')

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      console.log('SUCCESSFULLY LOGGED IN', res.data.user);
      navigate(ROUTES.HOME);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Log In</button>
    </div>
  );
};

export default LoginPage;
