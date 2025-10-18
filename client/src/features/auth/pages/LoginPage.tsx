import { useState } from 'react';
import api from '../../../api';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { AbsoluteCenter, Box, Button, Heading, Input, Link, VStack } from '@chakra-ui/react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await api.post('/authentication/login', { email, password });
      console.log('SUCCESSFULLY LOGGED IN', res.data);
      navigate(ROUTES.HOME);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <AbsoluteCenter>
      <Box p="10" backgroundColor={'whiteAlpha.100'} borderRadius={'2xl'}>
        <VStack>
          <Heading size="lg">Login</Heading>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button onClick={handleLogin}>Log In</Button>
          <Link href={ROUTES.SIGNUP}>Create an account!</Link>
        </VStack>
      </Box>
    </AbsoluteCenter>
  );
};

export default LoginPage;
