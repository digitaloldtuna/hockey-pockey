import { useState } from 'react';
import api from '../../../api';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      await api.post('/auth/signup', { email, password });
      alert('Signup successful!');
      navigate(ROUTES.LOGIN);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div>
      <h2>Signup</h2>
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
      <button onClick={handleSignup}>Sign Up</button>
    </div>
  );
};

export default SignupPage;
