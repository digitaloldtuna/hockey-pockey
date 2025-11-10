import { Box, Button, Flex, Heading, Input, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import DraftLayout from './DraftLayout';
import { useTitle } from '../../hooks/useTitle';

const CreateDraft = () => {
  useTitle('Create a Draft');
  const navigate = useNavigate();
  const [name, setName] = useState('');

  const handleCreateDraft = async () => {
    try {
      await api.post('/draft/create', { name }).then((res) => {
        console.log('CREATE REPSONSE', res);
        navigate(`/draft/${res.data.draft.id}`);
      });
    } catch (e: any) {
      alert(`Error creating a draft: ${e}`);
    }
  };

  return (
    <DraftLayout title="create a draft!">
      <Box rounded="2xl" backgroundColor="white" padding="5">
        <Text marginBottom="3">
          This draft will be for the <b>2026</b> NHL season.
        </Text>
        <Flex gap="3">
          <Heading alignContent="center">name</Heading>
          <Input
            type="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            backgroundColor="white"
          />
          <Button onClick={handleCreateDraft}>Create your draft!</Button>
        </Flex>
      </Box>
    </DraftLayout>
  );
};

export default CreateDraft;
