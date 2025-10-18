import { useState } from 'react';
import api from '../../../api';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { AbsoluteCenter, Box, Button, Heading, Input, VStack } from '@chakra-ui/react';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      await api.post('/authentication/signup', { email, password });
      alert('Signup successful!');
      navigate(ROUTES.LOGIN);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <AbsoluteCenter>
      <Box p="10" backgroundColor={'whiteAlpha.100'} borderRadius={'2xl'}>
        <VStack>
          <Heading size="lg">Welcome!</Heading>
          <Heading size="md">Signup</Heading>
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
          <Button onClick={handleSignup}>Sign Up</Button>
        </VStack>
      </Box>
    </AbsoluteCenter>
  );
};

export default SignupPage;
