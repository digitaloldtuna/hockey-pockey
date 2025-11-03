import { Button, Flex, Heading, Input, Link, Text } from '@chakra-ui/react';
import Layout from '../Layout';
import { useAuthentication } from '../../hooks/useAuthentication';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { ROUTES } from '../../constants/routes';

const CreateDraft = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [season, setSeason] = useState(2026);
  const { handleLogout } = useAuthentication();

  const handleCreateDraft = async () => {
    try {
      const response = await api.post('/draft/create', { name, season });
      navigate(ROUTES.HOME);
    } catch (e: any) {
      alert(`Error creating a draft: ${e}`);
    }
  };

  return (
    <Layout marginX="10">
      <Flex justify="space-between" align="end" marginTop="10">
        <Text fontSize="5xl" color="oxford">
          <b>create</b> a draft!
        </Text>
      </Flex>
      <Flex rounded="2xl" backgroundColor="whiteAlpha.500" padding="8" direction="column" gap="3">
        <Flex gap="3">
          <Heading alignContent="center">name</Heading>
          <Input
            type="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            backgroundColor="white"
          />
        </Flex>
        <Flex gap="3">
          <Heading alignContent="center">season</Heading>
          <Input
            type="season"
            value={season}
            onChange={(e) => setName(e.target.value)}
            backgroundColor="white"
            disabled={true}
          />
        </Flex>
        <Button onClick={handleCreateDraft}>Create!</Button>
      </Flex>
      <Flex justify="center">
        <Link color="highElfBlue" onClick={handleLogout}>
          logout
        </Link>
      </Flex>
    </Layout>
  );
};

export default CreateDraft;
