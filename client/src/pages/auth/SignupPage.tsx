import { useState } from 'react';
import { ROUTES } from '../../constants/routes';
import { AbsoluteCenter, Box, Button, Input, Link, Text, VStack } from '@chakra-ui/react';
import { useAuthentication } from '../../hooks/useAuthentication';
import { useTitle } from '../../hooks/useTitle';

const SignupPage = () => {
  useTitle('Sign Up');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { handleSignup } = useAuthentication();

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
          <Button onClick={() => handleSignup(email, password, name)}>Sign Up</Button>
          <Link href={ROUTES.LOGIN}>Already have an account? Log in!</Link>
        </VStack>
      </Box>
    </AbsoluteCenter>
  );
};

export default SignupPage;
