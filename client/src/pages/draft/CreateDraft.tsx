import { Button, Flex, Heading, Input, Link, Text } from '@chakra-ui/react';
import Layout from '../Layout';
import { useAuthentication } from '../../hooks/useAuthentication';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { ROUTES } from '../../constants/routes';
import DraftLayout from './DraftLayout';
import { useTitle } from '../../hooks/useTitle';

const CreateDraft = () => {
  useTitle('Create a Draft');
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
    <DraftLayout title="create a draft!">
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
    </DraftLayout>
  );
};

export default CreateDraft;
