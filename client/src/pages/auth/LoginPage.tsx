import { useState } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { AbsoluteCenter, Box, Button, Heading, Input, Link, Text, VStack } from '@chakra-ui/react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await api.post(
        '/authentication/login',
        { email, password },
        {
          withCredentials: true, // <-- important for cookies
        }
      );
      navigate(ROUTES.HOME);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <AbsoluteCenter>
      <Box p="10" borderRadius={'2xl'} backgroundColor="whiteAlpha.500">
        <VStack>
          <Text fontSize="5xl" lineHeight="0.75" fontWeight="bold" marginBottom="3">
            hockey
            <br />
            pockey
          </Text>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            backgroundColor="white"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            backgroundColor="white"
          />
          <Button onClick={handleLogin}>Log In</Button>
          <Link href={ROUTES.SIGNUP}>create an account!</Link>
        </VStack>
      </Box>
    </AbsoluteCenter>
  );
};

export default LoginPage;
