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

const DraftSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Flex
    direction="column"
    gap="3"
    rounded="card"
    bg="card"
    border="1px solid"
    borderColor="line"
    p={{ base: 4, md: 6 }}
    w="100%"
    maxW="100%"
    height="fit-content"
  >
    <Heading as="h2" fontSize="18px">
      {title}
    </Heading>
    {children}
  </Flex>
);

const DraftGrid = ({ drafts }: { drafts: Draft[] }) => (
  <Grid
    templateColumns="repeat(auto-fill, minmax(min(100%, 220px), 1fr))"
    gap={5}
    w="100%"
    maxW="100%"
  >
    {drafts.map((draft) => (
      <DraftCard key={draft.id} draft={draft} />
    ))}
  </Grid>
);

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

  const activeDrafts = drafts.filter((draft) => draft.status !== 'closed');
  const closedDrafts = drafts.filter((draft) => draft.status === 'closed');

  const handleCreateDraft = () => navigate(ROUTES.DRAFT.CREATE);
  const handleJoinDraft = () => navigate(ROUTES.DRAFT.JOIN);

  return (
    <Layout aside={<Profile />} showBrand>
      {/* Prevent horizontal scrolling */}
      <Box w="100%">
        <Grid templateColumns="minmax(0, 1fr)" gap={{ base: 0, md: 10 }} w="100%" maxW="100%">
          {/* Right Section */}
          <Box w="100%" maxW="100%">
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
              <Text
                fontSize={{ base: '3xl', md: '5xl' }}
                color="oxford"
                w="100%"
                fontFamily="heading"
              >
                Welcome, <b>{profile?.name}</b>!
              </Text>

              {/* Buttons */}
              <Grid
                templateColumns="repeat(2, 1fr)"
                gap={3}
                flexWrap="wrap"
                w={{ base: 'full', md: 'fit-content' }}
              >
                <Button
                  w={{ base: 'full', md: 'fit-content' }}
                  rounded="2xl"
                  colorPalette="oxford"
                  variant="surface"
                  onClick={handleJoinDraft}
                >
                  <UserPlus />
                  Join a draft
                </Button>

                <Button
                  w={{ base: 'full', md: 'fit-content' }}
                  rounded="2xl"
                  colorPalette="oxford"
                  variant="surface"
                  onClick={handleCreateDraft}
                >
                  <Plus />
                  Create a draft
                </Button>
              </Grid>
            </Flex>

            {/* Draft Cards Containers */}
            <Flex direction="column" gap="5">
              <DraftSection title="Your drafts">
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

                {!draftLoading && drafts.length > 0 && activeDrafts.length === 0 && (
                  <Text color="inkMuted">No active drafts</Text>
                )}

                {!draftLoading && activeDrafts.length > 0 && <DraftGrid drafts={activeDrafts} />}
              </DraftSection>

              {!draftLoading && closedDrafts.length > 0 && (
                <DraftSection title="Closed drafts">
                  <DraftGrid drafts={closedDrafts} />
                </DraftSection>
              )}
            </Flex>
          </Box>
        </Grid>
      </Box>
    </Layout>
  );
};

export default HomePage;
