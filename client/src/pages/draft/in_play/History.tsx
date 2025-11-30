import { Center, Flex, Heading, HStack, ScrollArea, Spinner, Text, VStack } from '@chakra-ui/react';
import { HistoryCard } from '../../../components';
import { Game, Profile } from '../../../constants/types';
import { useAuthentication } from '../../../hooks/useAuthentication';
import { useDraft } from '../../../hooks/useDraft';
import { formatDate } from '../../../utils';

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
    <ScrollArea.Root height="30rem" variant="hover">
      <ScrollArea.Viewport>
        <ScrollArea.Content>
          <Flex direction="column" gap="3">
            {history.map((entry) => {
              const date = formatDate(entry[0], true);
              const games = entry[1];
              return (
                <Flex direction="column" paddingBottom="8" key={date}>
                  <HStack
                    paddingBottom="1"
                    borderBottom="1px solid black"
                    marginBottom="3"
                    justify="space-between"
                  >
                    <Heading size={{ base: 'md', md: 'xl' }}>{date}</Heading>
                    <Text fontSize={{ base: 'sm', md: 'lg' }}>{winsIndicator(games, profile)}</Text>
                  </HStack>
                  <VStack>
                    {games.map((game) => (
                      <HistoryCard game={game} key={game.id} />
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
  const { profile } = useAuthentication();
  const { draft, history } = useDraft();
  if (!draft) {
    return <></>;
  }

  return (
    <Flex
      rounded="2xl"
      backgroundColor="whiteAlpha.500"
      padding={{ base: '3', md: '8' }}
      direction="column"
    >
      <HistoryList history={history} profile={profile} />
    </Flex>
  );
};

export default History;
