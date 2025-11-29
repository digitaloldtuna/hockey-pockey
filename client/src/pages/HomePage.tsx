import { Box, Button, Center, Flex, Grid, Heading, Spinner, Stack, Text } from '@chakra-ui/react';
import Layout from './Layout';
import { Plus, UserPlus } from 'lucide-react';
import { useAuthentication } from '../hooks/useAuthentication';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import DraftCard from '../components/DraftCard';
import { useTitle } from '../hooks/useTitle';
import { useEffect, useState } from 'react';
import api from '../api';
import Profile from '../components/Profile';
import { Draft } from '../constants/types';

const HomePage = () => {
  useTitle('Home');
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [draftLoading, setDraftLoading] = useState(false);
  const { profile } = useAuthentication();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchDrafts() {
      setDraftLoading(true);
      api
        .get('/draft/all')
        .then((res) => {
          setDraftLoading(false);
          setDrafts(res.data.drafts);
        })
        .catch((reason) => {
          setDraftLoading(false);
          console.log('Error fetching drafts', reason);
        });
    }
    fetchDrafts();
  }, []);

  const handleCreateDraft = () => navigate(ROUTES.DRAFT.CREATE);
  const handleJoinDraft = () => navigate(ROUTES.DRAFT.JOIN);

  return (
    <Layout>
      {/* Prevent horizontal scrolling */}
      <Box overflowX="hidden" w="100%">
        <Grid
          templateColumns={{ base: '1fr', md: '3fr 1fr' }}
          gap={{ base: 6, md: 10 }}
          w="100%"
          maxW="100%"
        >
          {/* Right Section */}
          <Box w="100%" maxW="100%" overflowX="hidden">
            {/* Top Section: Welcome + Buttons */}
            <Flex
              direction={{ base: 'column', md: 'row' }}
              justify="space-between"
              align="center"
              mt={{ base: 4, md: 10 }}
              mb={3}
              gap={{ base: 4, md: 0 }}
              w="100%"
              maxW="100%"
            >
              <Text fontSize={{ base: '3xl', md: '5xl' }} color="oxford" w="100%">
                Welcome, <b>{profile?.name}</b>!
              </Text>

              {/* Buttons */}
              <Flex
                gap={3}
                direction={{ base: 'column', sm: 'row' }}
                flexWrap="wrap"
                w="100%"
                maxW="100%"
                justify="end"
              >
                <Button
                  w={{ base: '100%', sm: 'auto' }}
                  rounded="2xl"
                  colorPalette="oxford"
                  variant="surface"
                  onClick={handleJoinDraft}
                >
                  <UserPlus />
                  Join a draft
                </Button>

                <Button
                  w={{ base: '100%', sm: 'auto' }}
                  rounded="2xl"
                  colorPalette="oxford"
                  variant="surface"
                  onClick={handleCreateDraft}
                >
                  <Plus />
                  Create a draft
                </Button>
              </Flex>
            </Flex>

            {/* Draft Cards Container */}
            <Flex
              rounded="2xl"
              backgroundColor="whiteAlpha.500"
              p={{ base: 4, md: 8 }}
              w="100%"
              maxW="100%"
              height="fit-content"
            >
              {/* Loading */}
              {draftLoading && (
                <Center w="full">
                  <Spinner size="xl" color="blue.500" />
                </Center>
              )}

              {/* Empty State */}
              {!draftLoading && drafts.length === 0 && (
                <Center w="full" textAlign="center">
                  <Stack>
                    <Heading size="md">You have no drafts 😶‍🌫️</Heading>
                    <Text>Join a draft, or create one!</Text>
                  </Stack>
                </Center>
              )}

              {/* Draft Cards Grid */}
              {!draftLoading && drafts.length > 0 && (
                <Grid
                  templateColumns={{
                    base: '1fr',
                    sm: 'repeat(2, 1fr)',
                    lg: 'repeat(3, 1fr)',
                  }}
                  gap={5}
                  w="100%"
                  maxW="100%"
                >
                  {drafts.map((draft) => (
                    <DraftCard key={draft.id} draft={draft} />
                  ))}
                </Grid>
              )}
            </Flex>
          </Box>

          {/* Profile Section */}
          <Box mt={{ base: 4, md: 10 }} w="100%" maxW="100%">
            <Profile />
          </Box>
        </Grid>
      </Box>
    </Layout>
  );
};

export default HomePage;
