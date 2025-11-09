import { Avatar, Button, Center, Flex, Grid, Heading, Link, Stack, Text } from '@chakra-ui/react';
import Layout from './Layout';
import { Plus, UserPlus } from 'lucide-react';
import { useAuthentication } from '../hooks/useAuthentication';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import DraftCard from '../components/DraftCard';
import { useTitle } from '../hooks/useTitle';
import { useState } from 'react';
import { MOCKED_DRAFTS } from '../constants/mocks';

const HomePage = () => {
  const [drafts, setDrafts] = useState(Object.values(MOCKED_DRAFTS));
  const { profile, handleLogout } = useAuthentication();
  const navigate = useNavigate();

  useTitle('Home');

  const handleCreateDraft = () => {
    navigate(ROUTES.DRAFT.CREATE);
  };

  const handleJoinDraft = () => {
    navigate(ROUTES.DRAFT.JOIN);
  };

  return (
    <Layout>
      <Flex justify="space-between" align="end" marginTop="10">
        <Flex gap="5" align="center">
          <Avatar.Root
            size="xl"
            onClick={() => navigate('/profile')}
            _hover={{ cursor: 'pointer' }}
          >
            <Avatar.Fallback name={profile?.name[0] || ''} />
          </Avatar.Root>
          <Text fontSize="5xl" color="oxford">
            Welcome, <b>{profile?.name}</b>!
          </Text>
        </Flex>
        <Flex gap="2" marginBottom="2">
          <Button rounded="2xl" colorPalette="oxford" variant="surface" onClick={handleJoinDraft}>
            <UserPlus />
            Join a draft
          </Button>
          <Button rounded="2xl" colorPalette="oxford" variant="surface" onClick={handleCreateDraft}>
            <Plus />
            Create a draft
          </Button>
        </Flex>
      </Flex>
      <Flex rounded="2xl" backgroundColor="whiteAlpha.500" padding="8">
        {drafts.length === 0 && (
          <Center width="100%">
            <Stack>
              <Heading>You have no drafts 😶‍🌫️</Heading>
              <Text>Join a draft, or create one!</Text>
            </Stack>
          </Center>
        )}
        <Grid templateColumns="repeat(3, 1fr)" gap="5">
          {drafts.map((draft) => (
            <DraftCard draft={draft} />
          ))}
        </Grid>
      </Flex>
      <Flex justify="center">
        <Link color="highElfBlue" onClick={handleLogout}>
          logout
        </Link>
      </Flex>
    </Layout>
  );
};

export default HomePage;
