import { Avatar, Flex, Grid, Heading, HStack, Text } from '@chakra-ui/react';
import { useState } from 'react';
import api from '../../../api';
import { useDraft } from '../../../hooks/useDraft';
import { toastError } from '../../../theme/toaster';
import { getAvatarColour } from '../../../utils';

const Home = () => {
  const [leaderboard, setLeaderboard] = useState<any[] | null>(null);
  const { draft } = useDraft();
  if (!draft) {
    return <></>;
  }

  const fetchLeaderboard = () => {
    api
      .get(`/draft/leaderboard?id=${draft.id}`)
      .then((res) => {
        setLeaderboard(res.data.leaderboard);
      })
      .catch((reason) => {
        setLeaderboard([]);
        toastError('Error fetching leaderboard for draft', reason);
      });
  };

  if (leaderboard === null) {
    fetchLeaderboard();
  }

  return (
    <Grid templateColumns="repeat(2, 1fr)" gap="10">
      {/* UPCOMING GAMES */}
      <Flex rounded="2xl" backgroundColor="whiteAlpha.500" padding="8" direction="column" gap="3">
        <Text fontSize="2xl" color="oxford">
          upcoming games
        </Text>
      </Flex>

      {/* LEADERBOARD */}
      <Flex rounded="2xl" backgroundColor="whiteAlpha.500" padding="8" direction="column" gap="3">
        <Text fontSize="2xl" color="oxford">
          leaderboard
        </Text>
        <Flex direction="column" gap="3">
          {leaderboard &&
            leaderboard.map((member) => (
              <Flex
                justify="space-between"
                padding="3"
                paddingX="5"
                rounded="2xl"
                backgroundColor="white"
                alignItems="center"
              >
                <HStack gap="3">
                  <Avatar.Root colorPalette={getAvatarColour(member.name)}>
                    <Avatar.Fallback name={member.name} />
                  </Avatar.Root>
                  <Heading size="md">{member.name}</Heading>
                </HStack>
                <Heading size="xl">{member.score}</Heading>
              </Flex>
            ))}
        </Flex>
      </Flex>
    </Grid>
  );
};

export default Home;
