import { Box, Button, Flex, Heading, Input, Link, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { ROUTES } from '../../constants/routes';
import DraftLayout from './DraftLayout';
import { useTitle } from '../../hooks/useTitle';

const JoinDraft = () => {
  useTitle('Join a Draft');
  const navigate = useNavigate();

  const [code, setCode] = useState('');

  const handleJoinDraft = async () => {
    try {
      await api.post('/draft/join', { code });
      navigate(ROUTES.HOME);
    } catch (e: any) {
      alert(`Error creating a draft: ${e}`);
    }
  };

  return (
    <DraftLayout title="join a draft!">
      <Box rounded="2xl" backgroundColor="white" padding="5">
        <Flex gap="3">
          <Heading alignContent="center">code</Heading>
          <Input
            type="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            backgroundColor="white"
          />
          <Button onClick={handleJoinDraft}>Join!</Button>
        </Flex>
      </Box>
    </DraftLayout>
  );
};

export default JoinDraft;
