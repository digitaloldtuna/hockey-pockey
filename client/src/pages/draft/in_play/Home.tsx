import { Center, Flex, Grid, Heading, Spinner, Text } from '@chakra-ui/react';
import { useState } from 'react';
import GameCard from '../../../components/GameCard';
import LeaderboardList from '../../../components/Leaderboard';
import {
  DayHeader,
  DonutChart,
  FilterChip,
  PageHeader,
  Pill,
  StatTile,
  Surface,
} from '../../../components/ui';
import { Game } from '../../../constants/types';
import { useAuthentication } from '../../../hooks/useAuthentication';
import { useDraft } from '../../../hooks/useDraft';
import { formatDate, memberHex, ordinal, placements, todayET } from '../../../utils';

const notCounted = (game: Game) => {
  return !game.homeMember || !game.visitingMember || game.homeMember.id === game.visitingMember.id;
};

const Home = () => {
  const [onlyCounted, setOnlyCounted] = useState<boolean>(false);
  const { profile } = useAuthentication();
  const { draft, upcomingGames, leaderboard } = useDraft();
  if (!draft) {
    return <></>;
  }

  const today = todayET();
  const days = (upcomingGames ?? [])
    .map(
      ([date, games]) =>
        [date, onlyCounted ? games.filter((g) => !notCounted(g)) : games] as [string, Game[]]
    )
    .filter(([, games]) => games.length > 0);

  const isMine = (g: Game) =>
    !!profile && (g.homeMember?.id === profile.id || g.visitingMember?.id === profile.id);
  const allGames = (upcomingGames ?? []).flatMap(([, games]) => games);
  const todayGames = (upcomingGames ?? []).find(([date]) => date === today)?.[1] ?? [];

  // tied scores share a place
  const places = leaderboard ? placements(leaderboard, (m) => m.score) : [];
  const myIndex = leaderboard ? leaderboard.findIndex((m) => m.id === profile?.id) : -1;
  const rank = myIndex >= 0 ? places[myIndex] : 0;
  const tied = rank > 0 && places.filter((place) => place === rank).length > 1;
  const myScore = leaderboard?.find((m) => m.id === profile?.id)?.score ?? 0;
  // the closest score above yours, and who has it; several tied there are named as the first plus a count
  const ahead = leaderboard?.filter((m) => m.score > myScore) ?? [];
  const nextScore = ahead.length > 0 ? Math.min(...ahead.map((m) => m.score)) : myScore;
  const nextUp = ahead.filter((m) => m.score === nextScore);
  const nextNames =
    nextUp.length > 1 ? `${nextUp[0].name} +${nextUp.length - 1}` : (nextUp[0]?.name ?? '');

  const loading = (
    <Center w="full" py="8">
      <Spinner size="xl" color="blue.500" />
    </Center>
  );

  return (
    <>
      <PageHeader title="Upcoming games" />

      {/* below lg the leaderboard comes first, then the tiles, then the games; at lg it sits beside the games */}
      <Grid
        templateColumns={{ base: 'minmax(0, 1fr)', lg: 'minmax(0, 1fr) 290px' }}
        templateAreas={{ base: '"board" "tiles" "games"', lg: '"tiles tiles" "games board"' }}
        gap="4"
        alignItems="start"
      >
        <Grid
          gridArea="tiles"
          templateColumns="repeat(auto-fit, minmax(min(180px, 100%), 1fr))"
          gap="3"
        >
          <StatTile
            label="Your points"
            value={leaderboard ? myScore : '-'}
            sub={
              rank === 0
                ? undefined
                : rank === 1
                  ? `${tied ? 'tied for ' : ''}1st place`
                  : `${tied ? 'tied for ' : ''}${rank}${ordinal(rank)} place · ${nextScore - myScore} behind ${nextNames}`
            }
            bg="ownerLavender"
          />
          <StatTile
            label="Games today"
            value={todayGames.length}
            sub={`${todayGames.filter(isMine).length} with your teams`}
            bg="ownerSun"
            delay="0.08s"
          />
          <StatTile
            label="This week"
            value={allGames.length}
            sub={`${allGames.filter(isMine).length} with your teams`}
            bg="ownerSky"
            delay="0.16s"
          />
        </Grid>
        <Surface as="section" aria-label="Games" gridArea="games">
          <Flex justify="flex-end" p="2">
            <FilterChip
              label="Counting games only"
              pressed={onlyCounted}
              onClick={() => setOnlyCounted(!onlyCounted)}
            />
          </Flex>
          {upcomingGames === null && loading}
          {upcomingGames !== null && days.length === 0 && (
            <Text p="4" color="inkMuted">
              There are no upcoming games
            </Text>
          )}
          {days.map(([date, games]) => (
            <section key={date}>
              <DayHeader
                title={formatDate(date, true)}
                right={`${games.length} ${games.length === 1 ? 'game' : 'games'}`}
              >
                {date === today && (
                  <Pill bg="ownerLavender" blink>
                    TODAY
                  </Pill>
                )}
              </DayHeader>
              <Flex direction="column" gap="1.5" p={{ base: 2, md: 2.5 }}>
                {games.map((game) => (
                  <GameCard key={game.id} fade={notCounted(game)} game={game} />
                ))}
              </Flex>
            </section>
          ))}
        </Surface>

        <Surface
          as="aside"
          aria-label="Leaderboard"
          gridArea="board"
          position={{ base: 'relative', lg: 'sticky' }}
          top={{ base: 'auto', lg: '4' }}
          maxH={{ base: 'none', lg: 'calc(100vh - 32px)' }}
          overflow="auto"
          p="14px"
          pb="16px"
        >
          <Flex align="baseline" justify="space-between">
            <Heading as="h2" fontSize="18px" m="0">
              Leaderboard
            </Heading>
            <Text fontSize="11px" color="inkMuted">
              Total points
            </Text>
          </Flex>
          {leaderboard === null ? (
            loading
          ) : (
            <>
              <Flex justify="center" mt="2" mb="1.5">
                <DonutChart
                  label="Share of total points by player"
                  segments={leaderboard.map((m) => ({
                    value: m.score,
                    fill: memberHex(m),
                  }))}
                />
              </Flex>
              <LeaderboardList entries={leaderboard} meId={profile?.id} />
            </>
          )}
        </Surface>
      </Grid>
    </>
  );
};

export default Home;
