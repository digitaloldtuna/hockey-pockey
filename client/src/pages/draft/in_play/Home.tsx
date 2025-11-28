import {
  Avatar,
  Flex,
  Grid,
  Heading,
  HStack,
  ScrollArea,
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

const formatDate = (dateString: string) => {
  const today = new Date();

  // Get tomorrow by adding 1 day
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // Format function
  const formatDate = (date: Date) => date.toISOString().split('T')[0]; // "YYYY-MM-DD"

  let date = dateString;
  if (date === formatDate(today)) {
    date = 'Today';
  } else if (date === formatDate(tomorrow)) {
    date = 'Tomorrow';
  } else {
    date = new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long', // full month name
      day: 'numeric',
    });
  }

  return date;
};

const Home = () => {
  const id = useId();
  const [gamesThisWeek, setGamesThisWeek] = useState<[string, Game[]][] | null>(null);
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
        setGamesThisWeek(res.data.games);
      })
      .catch((reason) => {
        setGamesThisWeek(null);
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

  if (gamesThisWeek === null) {
    fetchGamesForThisWeek();
  }

  const notCounted = (game: Game) => {
    return (
      !game.homeMember || !game.visitingMember || game.homeMember.id === game.visitingMember.id
    );
  };

  const filteredGamesThisWeek = (): [string, Game[]][] => {
    if (!gamesThisWeek) return [];
    return gamesThisWeek?.map(([date, games]) => {
      return [date, games.filter((game) => !notCounted(game))];
    });
  };

  return (
    <Grid templateColumns="repeat(2, 1fr)" gap="10">
      {/* UPCOMING GAMES */}
      <Flex rounded="2xl" backgroundColor="whiteAlpha.500" padding="8" direction="column">
        <Flex align="center" direction="horizontal" justify="space-between">
          <Text fontSize="2xl" color="oxford" fontWeight="bold">
            upcoming games
          </Text>
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

        <ScrollArea.Root height="30rem" variant="hover">
          <ScrollArea.Viewport>
            <ScrollArea.Content>
              <Flex direction="column" gap="3">
                {(filtered ? filteredGamesThisWeek() : gamesThisWeek || []).map((entry) => {
                  const date = formatDate(entry[0]);
                  const games = entry[1];
                  return (
                    <Flex direction="column">
                      <Heading
                        paddingBottom="1"
                        borderBottom="1px solid black"
                        marginBottom="3"
                        marginTop="7"
                      >
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
      </Flex>

      {/* LEADERBOARD */}
      <Flex rounded="2xl" backgroundColor="whiteAlpha.500" padding="8" direction="column" gap="3">
        <Text fontSize="2xl" color="oxford" fontWeight="bold">
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
                  <Avatar.Root colorPalette={getAvatarColour(member.id)}>
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
