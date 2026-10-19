import { Avatar, Box, Center, Flex, Grid, Heading, Spinner, Text } from '@chakra-ui/react';
import { useState } from 'react';
import GameCard from '../../../components/GameCard';
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
import {
  formatDate,
  memberColour,
  memberHex,
  placements,
  readableOn,
  todayET,
} from '../../../utils';

const ordinal = (n: number) =>
  ['th', 'st', 'nd', 'rd'][n % 100 > 10 && n % 100 < 14 ? 0 : n % 10 < 4 ? n % 10 : 0];

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
  const leaderScore = leaderboard?.[0]?.score ?? 0;
  // who is out in front; if several are tied there, name the first and count the rest
  const leaders = leaderboard?.filter((m) => m.score === leaderScore) ?? [];
  const leaderNames =
    leaders.length > 1 ? `${leaders[0].name} +${leaders.length - 1}` : (leaders[0]?.name ?? '');

  const loading = (
    <Center w="full" py="8">
      <Spinner size="xl" color="blue.500" />
    </Center>
  );

  return (
    <>
      <PageHeader title="Upcoming games" note="This week" />

      <Grid templateColumns="repeat(auto-fit, minmax(min(180px, 100%), 1fr))" gap="3">
        <StatTile
          label="Your points"
          value={leaderboard ? myScore : '-'}
          sub={
            rank === 0
              ? undefined
              : rank === 1
                ? `${tied ? 'tied for ' : ''}1st place`
                : `${tied ? 'tied for ' : ''}${rank}${ordinal(rank)} place · ${leaderScore - myScore} behind ${leaderNames}`
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

      <Flex wrap="wrap" align="flex-start" gap="4">
        <Surface as="section" aria-label="Games" flex="999 1 440px">
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
          flex="1 1 290px"
          position={{ base: 'relative', md: 'sticky' }}
          top="4"
          maxH={{ base: 'none', md: 'calc(100vh - 32px)' }}
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
              <Flex as="ol" direction="column" gap="1.5" listStyleType="none" m="0" p="0">
                {leaderboard.map((member, i) => (
                  <Flex
                    as="li"
                    key={member.id}
                    align="center"
                    gap="10px"
                    px="10px"
                    py="1.5"
                    rounded="12px"
                    border="1px solid #B3C1D0"
                    bg={member.id === profile?.id ? 'lavenderWash' : 'white'}
                  >
                    <Text w="14px" flex="none" fontWeight="bold" fontSize="13px" color="inkMuted">
                      {places[i]}
                    </Text>
                    <Avatar.Root
                      size="sm"
                      flex="none"
                      border="1px solid #4B6079"
                      bg={memberColour(member)}
                      color={readableOn(member.colour)}
                    >
                      <Avatar.Fallback name={member.name} />
                      <Avatar.Image src={member.profileImage || undefined} />
                    </Avatar.Root>
                    <Box flex="1 1 auto" minW="0">
                      <Text fontWeight="bold" fontSize="12px">
                        {member.name}
                      </Text>
                      <Text fontSize="10px" color="inkMuted" truncate>
                        {member.email}
                      </Text>
                    </Box>
                    <Text fontFamily="heading" fontWeight="bold" fontSize="20px" lineHeight="1">
                      {member.score}
                    </Text>
                  </Flex>
                ))}
              </Flex>
            </>
          )}
        </Surface>
      </Flex>
    </>
  );
};

export default Home;
