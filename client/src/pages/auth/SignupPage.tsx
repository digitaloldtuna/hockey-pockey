import { useState } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { AbsoluteCenter, Box, Button, Heading, Input, Link, Text, VStack } from '@chakra-ui/react';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      await api.post('/authentication/signup', { email, password, name });
      alert('Signup successful!');
      navigate(ROUTES.LOGIN);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err.response?.data?.error || 'Signup failed');
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
          <Input
            type="name"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            backgroundColor="white"
          />
          <Button onClick={handleSignup}>Sign Up</Button>
          <Link href={ROUTES.LOGIN}>Already have an account? Log in!</Link>
        </VStack>
      </Box>
    </AbsoluteCenter>
  );
};

export default SignupPage;
