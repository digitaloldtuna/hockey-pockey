import { useState } from 'react';
import { ROUTES } from '../../constants/routes';
import { AbsoluteCenter, Box, Button, Input, Link, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuthentication } from '../../hooks/useAuthentication';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { handleLogin } = useAuthentication();
  const navigate = useNavigate();

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
          <Button onClick={() => handleLogin(email, password).then(() => navigate(ROUTES.HOME))}>
            Log In
          </Button>
          <Link href={ROUTES.SIGNUP}>create an account!</Link>
        </VStack>
      </Box>
    </AbsoluteCenter>
  );
};

export default LoginPage;
