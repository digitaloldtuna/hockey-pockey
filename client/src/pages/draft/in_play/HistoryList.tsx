import { Center, Flex, Spinner, Text } from '@chakra-ui/react';
import { HistoryCard } from '../../../components';
import { Game, Profile } from '../../../constants/types';
import { DayHeader } from '../../../components/ui';
import { useAuthentication } from '../../../hooks/useAuthentication';
import { formatDate } from '../../../utils';

const winsIndicator = (games: Game[], profile: Profile) => {
  let count = 0;
  games.forEach((game) => {
    if (game.homeMember?.id === game.visitingMember?.id) return;
    if (
      (profile.id === game.homeMember?.id && game.homeScore > game.visitingScore) ||
      (profile.id === game.visitingMember?.id && game.homeScore < game.visitingScore)
    ) {
      count++;
    }
  });

  return count === 0 ? 'no wins' : `+${count} ${count === 1 ? 'win' : 'wins'}`;
};

const HistoryList = ({ history }: { history: [string, Game[]][] | null }) => {
  const { profile } = useAuthentication();

  if (history === null || profile === null) {
    return (
      <Center w="full" py="8">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  if (history.length === 0) {
    return (
      <Text p="4" color="inkMuted">
        No games match this filter
      </Text>
    );
  }

  return (
    <>
      {history.map(([date, games]) => (
        <section key={date}>
          <DayHeader title={formatDate(date, true)} right={winsIndicator(games, profile)} />
          <Flex direction="column" gap="1.5" p={{ base: 2, md: 2.5 }}>
            {games.map((game) => (
              <HistoryCard game={game} key={game.id} />
            ))}
          </Flex>
        </section>
      ))}
    </>
  );
};

export default HistoryList;
