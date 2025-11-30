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
import GameCard from '../../../components/GameCard';
import { Game } from '../../../constants/types';
import { useDraft } from '../../../hooks/useDraft';
import { Tooltip } from '../../../theme/tooltip';
import { getAvatarColour } from '../../../utils';

const formatDate = (date: string) => {
  const now = new Date();

  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
  }).format(now);

  now.setDate(now.getDate() + 1);
  const tomorrow = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
  }).format(now);

  console.log('dates', today, tomorrow);

  // Format function
  const prettyDate = new Date(date + 'T05:00:00Z').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long', // full month name
    day: 'numeric',
  });

  if (date === today) {
    date = `Today - ${prettyDate}`;
  } else if (date === tomorrow) {
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
                <Flex direction="column" paddingBottom="8" key={date}>
                  <Heading
                    paddingBottom="1"
                    borderBottom="1px solid black"
                    marginBottom="3"
                    size={{ base: 'md', md: 'xl' }}
                  >
                    {date}
                  </Heading>
                  <VStack>
                    {games.map((game) => (
                      <GameCard key={game.id} fade={notCounted(game)} game={game} />
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
          key={member.id}
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
  const [filtered, setFiltered] = useState<boolean>(false);
  const { draft, upcomingGames, leaderboard } = useDraft();
  if (!draft) {
    return <></>;
  }

  const filteredGamesThisWeek = (): [string, Game[]][] => {
    if (!upcomingGames) return [];
    return upcomingGames?.map(([date, games]) => {
      return [date, games.filter((game) => !notCounted(game))];
    });
  };

  return (
    <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap="5">
      {/* UPCOMING GAMES */}
      <Flex
        rounded={{ base: 'md', md: '2xl' }}
        backgroundColor="whiteAlpha.500"
        padding={{ base: '2', md: '8' }}
        direction="column"
        w="full"
        order={{ base: 2, md: 1 }}
      >
        <Flex
          align="center"
          direction="horizontal"
          justify="space-between"
          marginBottom={{ base: '2', md: '5' }}
        >
          <Heading size={{ base: 'lg', md: '2xl' }} color="oxford" fontWeight="bold">
            Upcoming Games
          </Heading>
          <Tooltip ids={{ trigger: id }} content="This is a tooltip">
            <Switch.Root
              ids={{ root: id }}
              checked={filtered}
              onCheckedChange={(e: { checked: boolean }) => setFiltered(e.checked)}
              size={{ base: 'xs', md: 'md' }}
            >
              <Switch.HiddenInput />
              <Switch.Control />
              <Switch.Label size="xs">valid games</Switch.Label>
            </Switch.Root>
          </Tooltip>
        </Flex>
        <UpcomingGames upcomingGames={filtered ? filteredGamesThisWeek() : upcomingGames} />
      </Flex>

      {/* LEADERBOARD */}
      <Flex
        rounded={{ base: 'md', md: '2xl' }}
        backgroundColor="whiteAlpha.500"
        padding={{ base: '2', md: '8' }}
        direction="column"
        gap={{ base: '1', md: '3' }}
        order={{ base: 1, md: 2 }}
      >
        <Heading size={{ base: 'lg', md: '2xl' }} color="oxford" fontWeight="bold">
          Leaderboard
        </Heading>
        <Flex direction="column" gap={{ base: '1', md: '3' }}>
          <Leaderboard leaderboard={leaderboard} />
        </Flex>
      </Flex>
    </Grid>
  );
};

export default Home;
