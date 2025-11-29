import {
  Box,
  Center,
  Flex,
  Grid,
  Heading,
  HStack,
  ScrollArea,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useState } from 'react';
import api from '../../../api';
import { HistoryCard } from '../../../components';
import { Game, Profile } from '../../../constants/types';
import { useAuthentication } from '../../../hooks/useAuthentication';
import { useDraft } from '../../../hooks/useDraft';
import { toastError } from '../../../theme/toaster';

const formatDate = (date: string) => {
  const today = new Date();

  // Get tomorrow by adding 1 day
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // Format function
  const formatDate = (date: Date) => date.toISOString().split('T')[0]; // "YYYY-MM-DD"
  const prettyDate = new Date(date + 'T05:00:00Z').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long', // full month name
    day: 'numeric',
  });

  if (date === formatDate(today)) {
    date = `Today - ${prettyDate}`;
  } else if (date === formatDate(tomorrow)) {
    date = `Tomorrow - ${prettyDate}`;
  } else {
    date = prettyDate;
  }

  return date;
};

const winsIndicator = (games: Game[], profile: Profile) => {
  if (!profile) return <></>;
  let count = 0;
  games.forEach((game) => {
    if (
      (profile.id === game.homeMember?.id && game.homeScore > game.visitingScore) ||
      (profile.id === game.visitingMember?.id && game.homeScore < game.visitingScore)
    ) {
      count++;
    }
  });

  if (count === 0) {
    return <>no wins 💀</>;
  } else {
    return <>+{count} wins</>;
  }
};

const HistoryList = ({
  history,
  profile,
}: {
  history: [string, Game[]][] | null;
  profile: Profile | null;
}) => {
  if (history === null || profile === null) {
    return (
      <Center w="full" h="null">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  return (
    <ScrollArea.Root height="32rem" variant="hover">
      <ScrollArea.Viewport>
        <ScrollArea.Content>
          <Flex direction="column" gap="3">
            {history &&
              history.map((entry) => {
                const date = formatDate(entry[0]);
                const games = entry[1];
                return (
                  <Flex direction="column" paddingBottom="8">
                    <HStack
                      paddingBottom="1"
                      borderBottom="1px solid black"
                      marginBottom="3"
                      justify="space-between"
                    >
                      <Heading>{date}</Heading>
                      <Text fontSize="lg">{winsIndicator(games, profile)}</Text>
                    </HStack>
                    <VStack>
                      {games.map((game) => (
                        <HistoryCard game={game} />
                      ))}
                    </VStack>
                  </Flex>
                );
              })}
          </Flex>
        </ScrollArea.Content>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar>
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
      <ScrollArea.Corner />
    </ScrollArea.Root>
  );
};

const History = () => {
  const [history, setHistory] = useState<[string, Game[]][] | null>(null);
  const { profile } = useAuthentication();
  const { draft } = useDraft();
  if (!draft) {
    return <></>;
  }

  const fetchHistory = () => {
    api
      .get(`/hockey/member/history?id=${draft.id}`)
      .then((res) => {
        const sortedHistory = res.data.history.reverse();
        setHistory(sortedHistory);
      })
      .catch((reason) => {
        setHistory(null);
        toastError('Cannot fetching games for week', reason);
      });
  };

  if (history === null) {
    fetchHistory();
  }

  return (
    <Flex rounded="2xl" backgroundColor="whiteAlpha.500" padding="8" direction="column">
      <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap="10">
        <HistoryList history={history} profile={profile} />
        <Box rounded="2xl" backgroundColor="white" width="sm" padding="5">
          Filters coming soon 😶‍🌫️
        </Box>
      </Grid>
    </Flex>
  );
};

export default History;
