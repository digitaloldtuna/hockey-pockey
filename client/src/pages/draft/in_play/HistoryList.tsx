import { Center, Flex, Heading, HStack, Spinner, Text, VStack } from '@chakra-ui/react';
import { HistoryCard } from '../../../components';
import { Game, Profile } from '../../../constants/types';
import { useAuthentication } from '../../../hooks/useAuthentication';
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

const HistoryList = ({ history }: { history: [string, Game[]][] | null }) => {
  const { profile } = useAuthentication();

  if (history === null || profile === null) {
    return (
      <Center w="full" h="null">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  return (
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
  );
};

export default HistoryList;
