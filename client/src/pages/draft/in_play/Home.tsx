import {
  Avatar,
  Center,
  Flex,
  Grid,
  Heading,
  HStack,
  ScrollArea,
  Spinner,
  Switch,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useId, useState } from 'react';
import api from '../../../api';
import GameCard from '../../../components/GameCard';
import { Game } from '../../../constants/types';
import { useDraft } from '../../../hooks/useDraft';
import { toastError } from '../../../theme/toaster';
import { Tooltip } from '../../../theme/tooltip';
import { getAvatarColour } from '../../../utils';

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

const notCounted = (game: Game) => {
  return !game.homeMember || !game.visitingMember || game.homeMember.id === game.visitingMember.id;
};

const UpcomingGames = ({ upcomingGames }: { upcomingGames: [string, Game[]][] | null }) => {
  if (upcomingGames === null) {
    return (
      <Center w="full" h="full">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  if (upcomingGames.length === 0) {
    return <Text>There are no upcoming games</Text>;
  }

  return (
    <ScrollArea.Root height="30rem" variant="hover">
      <ScrollArea.Viewport>
        <ScrollArea.Content>
          <Flex direction="column" gap="3">
            {upcomingGames.map((entry) => {
              const date = formatDate(entry[0]);
              const games = entry[1];
              return (
                <Flex direction="column" paddingBottom="8">
                  <Heading paddingBottom="1" borderBottom="1px solid black" marginBottom="3">
                    {date}
                  </Heading>
                  <VStack>
                    {games.map((game) => (
                      <GameCard fade={notCounted(game)} game={game} />
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

const Leaderboard = ({
  leaderboard,
}: {
  leaderboard:
    | { id: string; name: string; email: string; profileImage: string; score: number }[]
    | null;
}) => {
  if (leaderboard === null) {
    return (
      <Center w="full" h="full">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  return (
    <>
      {leaderboard.map((member) => (
        <Flex
          justify="space-between"
          padding="3"
          paddingX="5"
          rounded="2xl"
          backgroundColor="white"
          alignItems="center"
        >
          <HStack gap="3">
            <Avatar.Root colorPalette={getAvatarColour(member.id)}>
              <Avatar.Fallback name={member.name} />
              <Avatar.Image src={member.profileImage || undefined} />
            </Avatar.Root>
            <VStack align="start" gap="0">
              <Text fontSize="sm" fontWeight="bold">
                {member.name}
              </Text>
              <Text fontSize="xs">{member.email}</Text>
            </VStack>
          </HStack>
          <Heading size="xl">{member.score}</Heading>
        </Flex>
      ))}
    </>
  );
};

const Home = () => {
  const id = useId();
  const [upcomingGames, setUpcomingGames] = useState<[string, Game[]][] | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[] | null>(null);
  const [filtered, setFiltered] = useState<boolean>(false);
  const { draft } = useDraft();
  if (!draft) {
    return <></>;
  }

  const fetchGamesForThisWeek = () => {
    api
      .get(`/hockey/games/thisweek?id=${draft.id}`)
      .then((res) => {
        setUpcomingGames(res.data.games);
      })
      .catch((reason) => {
        setUpcomingGames(null);
        toastError('Cannot fetching games for week', reason);
      });
  };

  const fetchLeaderboard = () => {
    api
      .get(`/draft/leaderboard?id=${draft.id}`)
      .then((res) => {
        setLeaderboard(res.data.leaderboard);
      })
      .catch((reason) => {
        setLeaderboard([]);
        toastError('Cannot fetch leaderboard for draft', reason);
      });
  };

  if (leaderboard === null) {
    fetchLeaderboard();
  }

  if (upcomingGames === null) {
    fetchGamesForThisWeek();
  }

  const notCounted = (game: Game) => {
    return (
      !game.homeMember || !game.visitingMember || game.homeMember.id === game.visitingMember.id
    );
  };

  const filteredGamesThisWeek = (): [string, Game[]][] => {
    if (!upcomingGames) return [];
    return upcomingGames?.map(([date, games]) => {
      return [date, games.filter((game) => !notCounted(game))];
    });
  };

  return (
    <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap="10">
      {/* UPCOMING GAMES */}
      <Flex rounded="2xl" backgroundColor="whiteAlpha.500" padding="8" direction="column">
        <Flex align="center" direction="horizontal" justify="space-between" marginBottom="5">
          <Heading size="2xl" color="oxford" fontWeight="bold">
            Upcoming Games
          </Heading>
          <Tooltip ids={{ trigger: id }} content="This is a tooltip">
            <Switch.Root
              ids={{ root: id }}
              checked={filtered}
              onCheckedChange={(e: { checked: boolean }) => setFiltered(e.checked)}
            >
              <Switch.HiddenInput />
              <Switch.Control />
              <Switch.Label>valid games</Switch.Label>
            </Switch.Root>
          </Tooltip>
        </Flex>
        <UpcomingGames upcomingGames={filtered ? filteredGamesThisWeek() : upcomingGames} />
      </Flex>

      {/* LEADERBOARD */}
      <Flex rounded="2xl" backgroundColor="whiteAlpha.500" padding="8" direction="column" gap="3">
        <Heading size="2xl" color="oxford" fontWeight="bold">
          Leaderboard
        </Heading>
        <Flex direction="column" gap="3">
          <Leaderboard leaderboard={leaderboard} />
        </Flex>
      </Flex>
    </Grid>
  );
};

export default Home;
