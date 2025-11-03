import { Button, Flex, Heading, Input, Link, Text } from '@chakra-ui/react';
import Layout from '../Layout';
import { useAuthentication } from '../../hooks/useAuthentication';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { ROUTES } from '../../constants/routes';

const JoinDraft = () => {
  const navigate = useNavigate();

  const [code, setCode] = useState('');
  const { handleLogout } = useAuthentication();

  const handleJoinDraft = async () => {
    try {
      const response = await api.post('/draft/join', { code });
      navigate(ROUTES.HOME);
    } catch (e: any) {
      alert(`Error creating a draft: ${e}`);
    }
  };

  return (
    <Layout marginX="10">
      <Flex justify="space-between" align="end" marginTop="10">
        <Text fontSize="5xl" color="oxford">
          <b>join</b> a draft!
        </Text>
      </Flex>
      <Flex rounded="2xl" backgroundColor="whiteAlpha.500" padding="8" direction="column" gap="3">
        <Flex gap="3">
          <Heading alignContent="center">code</Heading>
          <Input
            type="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            backgroundColor="white"
          />
        </Flex>
        <Button onClick={handleJoinDraft}>Join!</Button>
      </Flex>
      <Flex justify="center">
        <Link color="highElfBlue" onClick={handleLogout}>
          logout
        </Link>
      </Flex>
    </Layout>
  );
};

export default JoinDraft;
