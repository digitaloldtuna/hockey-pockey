import { Box, Center, Flex, Grid, Heading, Spinner, Text } from '@chakra-ui/react';
import LeaderboardList from '../../components/Leaderboard';
import { DonutChart, StatTile } from '../../components/ui';
import { Draft } from '../../constants/types';
import { useAuthentication } from '../../hooks/useAuthentication';
import { useDraft } from '../../hooks/useDraft';
import { memberHex, ordinal, placements } from '../../utils';

type Props = {
  draft: Draft;
};

// the season is over: show how everyone finished
const ClosedDraft = ({ draft }: Props) => {
  const { profile } = useAuthentication();
  const { leaderboard } = useDraft();

  if (leaderboard === null) {
    return (
      <Center py="10">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <Text color="inkMuted" py="4">
        There are no final standings for this draft.
      </Text>
    );
  }

  const places = placements(leaderboard, (member) => member.score);
  const champions = leaderboard.filter((_, i) => places[i] === 1);
  const myIndex = leaderboard.findIndex((member) => member.id === profile?.id);
  const myPlace = myIndex >= 0 ? places[myIndex] : 0;
  const tiedWithMe = myPlace > 0 && places.filter((place) => place === myPlace).length > 1;
  const totalPoints = leaderboard.reduce((sum, member) => sum + member.score, 0);

  return (
    <Flex direction="column" gap="4">
      <Grid templateColumns="repeat(auto-fit, minmax(min(180px, 100%), 1fr))" gap="3">
        <StatTile
          label={champions.length > 1 ? 'Champions' : 'Champion'}
          value={champions.map((member) => member.name).join(' & ')}
          sub={`${champions[0].score} points`}
          bg="ownerSun"
        />
        <StatTile
          label="Your finish"
          value={myPlace > 0 ? `${myPlace}${ordinal(myPlace)}` : '-'}
          sub={
            myPlace > 0
              ? `${tiedWithMe ? 'tied · ' : ''}${leaderboard[myIndex].score} points`
              : 'You did not play in this draft'
          }
          bg="ownerLavender"
          delay="0.08s"
        />
        <StatTile
          label="Players"
          value={leaderboard.length}
          sub={`${totalPoints} points scored`}
          bg="ownerSky"
          delay="0.16s"
        />
      </Grid>

      <Box>
        <Flex align="baseline" justify="space-between" mb="3">
          <Heading as="h2" fontSize="18px" m="0">
            Leaderboard
          </Heading>
          <Text fontSize="11px" color="inkMuted">
            {draft.name} · {draft.season} season
          </Text>
        </Flex>
        <Flex wrap="wrap" align="center" justify="center" gap="5">
          <DonutChart
            label="Share of total points by player"
            segments={leaderboard.map((member) => ({
              value: member.score,
              fill: memberHex(member),
            }))}
          />
          <Box flex="1 1 280px" minW="0">
            <LeaderboardList entries={leaderboard} meId={profile?.id} />
          </Box>
        </Flex>
      </Box>
    </Flex>
  );
};

export default ClosedDraft;
