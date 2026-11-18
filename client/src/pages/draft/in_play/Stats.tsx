import { Avatar, Box, Center, Flex, Grid, Heading, Image, Spinner, Text } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import api from '../../../api';
import GameCard from '../../../components/GameCard';
import { DayHeader, FilterChip, PageHeader, Pill, StatTile, Surface } from '../../../components/ui';
import { DraftStats, HeadToHead, Profile, StatsPlayer, StatsTeam } from '../../../constants/types';
import { useAuthentication } from '../../../hooks/useAuthentication';
import { useDraft } from '../../../hooks/useDraft';
import { formatDate, memberColour, memberHex, readableOn } from '../../../utils';

// an owner's name stands out in the tiles' small print
const OwnerName = ({ member }: { member: Profile }) => (
  <Text as="strong" fontWeight="extrabold">
    {member.name}
  </Text>
);

// "Edmonton Oilers · Adele", with the owner left off for an undrafted team
const leaderLine = (leader: { teamName: string; member: Profile | null }) => (
  <>
    {leader.teamName}
    {leader.member && (
      <>
        {' · '}
        <OwnerName member={leader.member} />
      </>
    )}
  </>
);

type VersusSide = NonNullable<HeadToHead['bestPlayers']>['mine'];

// a big number with a small unit after it: 20 G
const WithUnit = ({ value, unit }: { value: number; unit: string }) => (
  <>
    {value}
    <Text as="span" fontSize="15px" fontFamily="body" fontWeight="semibold" ml="1.5">
      {unit}
    </Text>
  </>
);

// save percentage is shown hockey style: .912
const savePct = (value: number) => value.toFixed(3).replace(/^0/, '');
const signed = (value: number) => (value > 0 ? `+${value}` : `${value}`);
// "Nov 19"
const shortDate = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const OwnerPill = ({ member }: { member: Profile | null }) =>
  member ? (
    <Pill bg={memberColour(member)} color={readableOn(member.colour)}>
      {member.name}
    </Pill>
  ) : (
    <Pill bg="ownerNone">Not drafted</Pill>
  );

const Headshot = ({ player, size = 'md' }: { player: StatsPlayer; size?: 'md' | 'xl' }) => (
  <Avatar.Root size={size} flex="none" bg="card" border="1px solid #8FA1B5">
    <Avatar.Fallback name={player.name} />
    <Avatar.Image src={player.headshot} alt="" />
  </Avatar.Root>
);

// one player: photo, name, team and owner on the left, the number that matters on the right
const PlayerRow = ({
  player,
  member,
  value,
  unit,
  detail,
  rank,
  highlight,
  showOwner = true,
}: {
  player: StatsPlayer;
  member: Profile | null;
  showOwner?: boolean;
  value: ReactNode;
  unit: string;
  detail?: string;
  rank?: number;
  highlight?: boolean;
}) => (
  <Flex
    align="center"
    gap="3"
    px="14px"
    py="2"
    bg={highlight ? 'lavenderWash' : 'transparent'}
    borderTop="1px solid"
    borderColor="lineSoft"
  >
    {rank !== undefined && (
      <Text w="4" fontWeight="bold" color="inkMuted" fontSize="12px">
        {rank}
      </Text>
    )}
    <Headshot player={player} />
    <Box minW="0" flex="1">
      <Text fontWeight="semibold" fontSize="13px" truncate>
        {player.name}
      </Text>
      <Flex align="center" gap="1.5" wrap="wrap" mt="1px">
        <Text fontSize="11px" color="inkMuted" fontWeight="medium">
          {player.teamName}
        </Text>
        {showOwner && <OwnerPill member={member} />}
      </Flex>
    </Box>
    <Box textAlign="right" flex="none">
      <Text fontFamily="heading" fontWeight="bold" fontSize="20px" lineHeight="1.1">
        {value}
        <Text as="span" fontSize="11px" fontFamily="body" fontWeight="semibold" ml="1">
          {unit}
        </Text>
      </Text>
      {detail && (
        <Text fontSize="10px" color="inkMuted">
          {detail}
        </Text>
      )}
    </Box>
  </Flex>
);

// one team: logo and name on the left, its wins on the right
const TeamRow = ({
  label,
  best,
  member,
}: {
  label: string;
  best: { team: StatsTeam; wins: number } | null;
  member: Profile;
}) => (
  <Box borderTop="1px solid" borderColor="lineSoft">
    <Text px="14px" pt="2" fontSize="11px" fontWeight="semibold" color="inkMuted">
      {label}
    </Text>
    {best ? (
      <Flex align="center" gap="3" px="14px" pt="1" pb="2.5">
        <Flex
          w="44px"
          h="44px"
          flex="none"
          align="center"
          justify="center"
          rounded="full"
          bg={memberColour(member)}
          border="1px solid #4B6079"
        >
          {best.team.logo && <Image src={best.team.logo} alt="" boxSize="32px" fit="contain" />}
        </Flex>
        <Text flex="1" minW="0" fontWeight="semibold" fontSize="13px" truncate>
          {best.team.fullName}
        </Text>
        <Text fontFamily="heading" fontWeight="bold" fontSize="20px" lineHeight="1.1">
          {best.wins}
          <Text as="span" fontSize="11px" fontFamily="body" fontWeight="semibold" ml="1">
            {best.wins === 1 ? 'win' : 'wins'}
          </Text>
        </Text>
      </Flex>
    ) : (
      <Text px="14px" pt="1" pb="2.5" fontSize="12px" color="inkMuted">
        No wins yet
      </Text>
    )}
  </Box>
);

// The card layout switches from stacked to three columns when the stats area is this wide: the
// width at which three 320px columns and their gaps fit. Measured on the stats area itself (a
// container query), so the top row and the columns below always switch together.
const THREE_COLUMNS = '@container stats (min-width: 992px)';

const Section = ({
  title,
  description,
  children,
  css,
}: {
  title: string;
  description: string;
  children: ReactNode;
  css?: Record<string, unknown>;
}) => (
  // kept whole, so a card never splits across two columns
  <Surface as="section" aria-label={title} pb="1" mb="4" css={{ breakInside: 'avoid', ...css }}>
    <Box px="14px" pt="12px" pb="2">
      <Heading as="h2" fontSize="18px" m="0">
        {title}
      </Heading>
      <Text fontSize="11px" color="inkMuted" mt="1px">
        {description}
      </Text>
    </Box>
    {children}
  </Surface>
);

// cards of different heights stacked in columns, without the gaps a grid would leave
const Columns = ({ children }: { children: ReactNode }) => (
  <Box css={{ columns: '3 320px', columnGap: '16px' }} mb="-4">
    {children}
  </Box>
);

const Unavailable = () => (
  <Text
    px="14px"
    py="4"
    fontSize="12px"
    color="inkMuted"
    borderTop="1px solid"
    borderColor="lineSoft"
  >
    The NHL didn&apos;t answer for this one. Try again in a few minutes.
  </Text>
);

const SubHeading = ({ children }: { children: ReactNode }) => (
  <Text
    px="14px"
    py="1.5"
    bg="lineSoft"
    fontSize="11px"
    fontWeight="bold"
    letterSpacing="0.08em"
    textTransform="uppercase"
  >
    {children}
  </Text>
);

const GoalsChart = ({ owners, meId }: { owners: DraftStats['owners']; meId?: string }) => {
  const most = Math.max(1, ...owners.map((o) => o.goals ?? 0));
  return (
    <Flex
      direction="column"
      gap="2.5"
      px="14px"
      py="3"
      borderTop="1px solid"
      borderColor="lineSoft"
    >
      {owners.map((owner) => (
        <Box key={owner.member.id}>
          <Flex justify="space-between" fontSize="12px" mb="1">
            <Text fontWeight={owner.member.id === meId ? 'bold' : 'semibold'}>
              {owner.member.name}
            </Text>
            <Text fontWeight="bold">
              {owner.goals}{' '}
              <Text as="span" color="inkMuted" fontWeight="medium">
                from {owner.teams.length} teams
              </Text>
            </Text>
          </Flex>
          <Box h="14px" bg="lineSoft" rounded="full" overflow="hidden">
            <Box
              className="grow"
              h="full"
              w={`${((owner.goals ?? 0) / most) * 100}%`}
              bg={memberHex(owner.member)}
              border="1px solid #4B6079"
              rounded="full"
            />
          </Box>
        </Box>
      ))}
    </Flex>
  );
};

// one side's best scorer and goalie, counting only the games between the two of you; the owner
// is in the sub-heading above, so the rows leave their tag off
const BestAgainst = ({ side, member }: { side: VersusSide; member: Profile }) => (
  <>
    {side.scorer && (
      <PlayerRow
        player={side.scorer}
        member={member}
        showOwner={false}
        value={side.scorer.goals}
        unit="G"
        detail={`${side.scorer.points} pts in ${side.scorer.gamesPlayed} games`}
      />
    )}
    {side.goalie && (
      <PlayerRow
        player={side.goalie}
        member={member}
        showOwner={false}
        value={side.goalie.saves}
        unit="saves"
        detail={`${savePct(side.goalie.savePercentage)} SV% · ${side.goalie.wins} ${side.goalie.wins === 1 ? 'win' : 'wins'}`}
      />
    )}
    {!side.scorer && !side.goalie && (
      <Text
        px="14px"
        py="3"
        fontSize="12px"
        color="inkMuted"
        borderTop="1px solid"
        borderColor="lineSoft"
      >
        Nothing yet
      </Text>
    )}
  </>
);

// wins each way as one bar in both people's colours
const RecordBar = ({ h2h, me, them }: { h2h: HeadToHead; me: Profile; them: Profile }) => {
  const total = h2h.wins + h2h.losses;
  const share = total === 0 ? 50 : (h2h.wins / total) * 100;
  return (
    <Box px="14px" py="3" borderTop="1px solid" borderColor="lineSoft">
      <Flex justify="space-between" fontSize="12px" mb="1">
        <Text fontWeight="bold">You {h2h.wins}</Text>
        <Text fontWeight="bold">
          {them.name} {h2h.losses}
        </Text>
      </Flex>
      <Flex h="14px" rounded="full" overflow="hidden" border="1px solid #4B6079" bg="lineSoft">
        {total > 0 && (
          <>
            <Box className="grow" w={`${share}%`} bg={memberHex(me)} />
            <Box flex="1" bg={memberHex(them)} borderLeft="1px solid #4B6079" />
          </>
        )}
      </Flex>
      <Text fontSize="10px" color="inkMuted" mt="1">
        {total === 0
          ? 'You have not played each other yet'
          : `${total} games between your teams this season`}
      </Text>
    </Box>
  );
};

// you against one other person
const PersonView = ({ stats, me, them }: { stats: DraftStats; me: Profile; them: Profile }) => {
  const h2h = stats.headToHead[them.id];
  if (!h2h) {
    return (
      <Surface>
        <Text p="4" color="inkMuted">
          There is nothing to compare with {them.name} yet.
        </Text>
      </Surface>
    );
  }

  const gap = h2h.points.mine - h2h.points.theirs;
  const next = h2h.nextMeeting;

  return (
    <>
      <Grid templateColumns="repeat(auto-fit, minmax(min(180px, 100%), 1fr))" gap="3">
        <StatTile
          label="Head To Head"
          value={`${h2h.wins} - ${h2h.losses}`}
          sub={
            <>
              your wins · <OwnerName member={them} />
              &apos;s wins
            </>
          }
          bg="ownerLavender"
        />
        <StatTile
          label="Points Gap"
          value={signed(gap)}
          sub={
            <>
              You {h2h.points.mine} · <OwnerName member={them} /> {h2h.points.theirs}
            </>
          }
          bg="ownerSky"
          delay="0.08s"
        />
        <StatTile
          label="Next Meeting"
          value={next ? shortDate(next.gameDate) : '-'}
          sub={
            next
              ? `${next.visitingTeam?.fullName} at ${next.homeTeam?.fullName}`
              : 'No games left between you'
          }
          bg="ownerSage"
          delay="0.16s"
        />
      </Grid>

      {/* head to head and best players on the left, the games coming up on the right */}
      <Box css={{ containerType: 'inline-size', containerName: 'versus' }}>
        <Grid
          css={{
            gridTemplateColumns: 'minmax(0, 1fr)',
            columnGap: '16px',
            alignItems: 'start',
            '@container versus (min-width: 720px)': {
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            },
          }}
          mb="-4"
        >
          <Box>
            <Section
              title="Head To Head"
              description={`Every finished game between your teams and ${them.name}'s`}
            >
              <RecordBar h2h={h2h} me={me} them={them} />
              <TeamRow
                label={`Your team that has beaten ${them.name} most`}
                best={h2h.myBestTeam}
                member={me}
              />
              <TeamRow
                label={`${them.name}'s team that has beaten you most`}
                best={h2h.theirBestTeam}
                member={them}
              />
            </Section>

            <Section
              title="Best Players"
              description="Most goals and saves in the games between your teams"
            >
              {h2h.bestPlayers ? (
                <>
                  <SubHeading>{them.name}</SubHeading>
                  <BestAgainst side={h2h.bestPlayers.theirs} member={them} />
                  <SubHeading>You</SubHeading>
                  <BestAgainst side={h2h.bestPlayers.mine} member={me} />
                </>
              ) : (
                <Text
                  px="14px"
                  py="4"
                  fontSize="12px"
                  color="inkMuted"
                  borderTop="1px solid"
                  borderColor="lineSoft"
                >
                  Still adding up {h2h.gamesStillToCount} of your games against {them.name}. Check
                  back in a few minutes.
                </Text>
              )}
            </Section>
          </Box>

          <Section
            title="Upcoming Games"
            description={`Games between your teams and ${them.name}'s in the next 3 days`}
          >
            {h2h.upcoming.length === 0 ? (
              <Text
                px="14px"
                py="4"
                fontSize="12px"
                color="inkMuted"
                borderTop="1px solid"
                borderColor="lineSoft"
              >
                {next
                  ? `No games between you in the next 3 days. The next one is on ${formatDate(next.gameDate)}.`
                  : 'No games left between you this season.'}
              </Text>
            ) : (
              h2h.upcoming.map(([date, games]) => (
                <section key={date}>
                  <DayHeader title={formatDate(date, true)} />
                  <Flex direction="column" gap="1.5" p="2">
                    {games.map((game) => (
                      <GameCard key={game.id} game={game} />
                    ))}
                  </Flex>
                </section>
              ))
            )}
          </Section>
        </Grid>
      </Box>
    </>
  );
};

// the whole draft at once
const Overview = ({ stats, meId }: { stats: DraftStats; meId?: string }) => {
  const mine = (member: Profile | null) => !!member && member.id === meId;
  const topOwner = stats.owners.find((o) => o.goals !== null);
  const topScorer = stats.leaders?.goals[0];
  const topGoalie = stats.leaders?.saves[0];

  const scorers = stats.owners
    .filter((o) => o.bestScorer)
    .sort(
      (a, b) =>
        b.bestScorer!.goals - a.bestScorer!.goals || b.bestScorer!.points - a.bestScorer!.points
    );
  const goalies = stats.owners
    .filter((o) => o.bestGoalie)
    .sort((a, b) => b.bestGoalie!.saves - a.bestGoalie!.saves);
  const scorersMissing = stats.owners.every((o) => !o.bestScorer);

  const topScorerCard = (
    <Section title="Top Scorer" description="Most goals by one player across each person's teams">
      {scorersMissing ? (
        <Unavailable />
      ) : (
        scorers.map((owner) => (
          <PlayerRow
            key={owner.member.id}
            player={owner.bestScorer!}
            member={owner.member}
            value={owner.bestScorer!.goals}
            unit="G"
            detail={`${owner.bestScorer!.points} pts in ${owner.bestScorer!.gamesPlayed} games`}
            highlight={mine(owner.member)}
          />
        ))
      )}
    </Section>
  );

  return (
    <>
      <Grid templateColumns="repeat(auto-fit, minmax(min(180px, 100%), 1fr))" gap="3">
        <StatTile
          label="Most Goals"
          value={topOwner?.goals ?? '-'}
          sub={
            topOwner ? (
              <>
                scored by <OwnerName member={topOwner.member} />
                &apos;s teams
              </>
            ) : undefined
          }
          bg="ownerLavender"
        />
        <StatTile
          label="League's Top Scorer"
          heading={topScorer?.name}
          value={topScorer ? <WithUnit value={topScorer.goals} unit="G" /> : '-'}
          sub={topScorer ? leaderLine(topScorer) : undefined}
          image={topScorer && <Headshot player={topScorer} size="xl" />}
          valueSize="24px"
          bg="ownerSky"
          delay="0.08s"
        />
        <StatTile
          label="Most Saves"
          heading={topGoalie?.name}
          value={topGoalie ? <WithUnit value={topGoalie.saves} unit="saves" /> : '-'}
          sub={topGoalie ? leaderLine(topGoalie) : undefined}
          image={topGoalie && <Headshot player={topGoalie} size="xl" />}
          valueSize="24px"
          bg="ownerSage"
          delay="0.16s"
        />
      </Grid>

      <Box css={{ containerType: 'inline-size', containerName: 'stats' }}>
        {/* league leaders across two columns, with the top scorers beside them */}
        <Grid
          css={{
            gridTemplateColumns: 'minmax(0, 1fr)',
            columnGap: '16px',
            alignItems: 'start',
            [THREE_COLUMNS]: { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
          }}
        >
          <Section
            title="League Leaders"
            description="The NHL's best this season, and who drafted their team"
            css={{ [THREE_COLUMNS]: { gridColumn: 'span 2' } }}
          >
            {stats.leaders === null ? (
              <Unavailable />
            ) : (
              // goals and saves side by side once the card is wide enough for both
              <Box css={{ containerType: 'inline-size' }}>
                <Grid
                  css={{
                    gridTemplateColumns: 'minmax(0, 1fr)',
                    '@container (min-width: 600px)': {
                      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                      '& > :last-child': { borderLeft: '1px solid #C9D6E4' },
                    },
                  }}
                >
                  <Box>
                    <SubHeading>Goals</SubHeading>
                    {stats.leaders.goals.map((player, i) => (
                      <PlayerRow
                        key={player.id}
                        rank={i + 1}
                        player={player}
                        member={player.member}
                        value={player.goals}
                        unit="G"
                        highlight={mine(player.member)}
                      />
                    ))}
                  </Box>
                  <Box>
                    <SubHeading>Saves</SubHeading>
                    {stats.leaders.saves.map((player, i) => (
                      <PlayerRow
                        key={player.id}
                        rank={i + 1}
                        player={player}
                        member={player.member}
                        value={player.saves}
                        unit="saves"
                        detail={`${savePct(player.savePercentage)} SV%`}
                        highlight={mine(player.member)}
                      />
                    ))}
                  </Box>
                </Grid>
              </Box>
            )}
          </Section>
          {/* shown here only with three columns; otherwise it joins the cards below */}
          <Box display="none" css={{ [THREE_COLUMNS]: { display: 'block' } }}>
            {topScorerCard}
          </Box>
        </Grid>

        <Columns>
          <Box css={{ breakInside: 'avoid', [THREE_COLUMNS]: { display: 'none' } }}>
            {topScorerCard}
          </Box>
          <Section
            title="The Wall"
            description="The goalie with the most saves on each person's teams"
          >
            {scorersMissing ? (
              <Unavailable />
            ) : (
              goalies.map((owner) => (
                <PlayerRow
                  key={owner.member.id}
                  player={owner.bestGoalie!}
                  member={owner.member}
                  value={owner.bestGoalie!.saves}
                  unit="saves"
                  detail={`${savePct(owner.bestGoalie!.savePercentage)} SV% · ${owner.bestGoalie!.wins} wins`}
                  highlight={mine(owner.member)}
                />
              ))
            )}
          </Section>

          <Section
            title="Goals By Owner"
            description="Every goal scored by each person's teams this season"
          >
            {topOwner ? <GoalsChart owners={stats.owners} meId={meId} /> : <Unavailable />}
          </Section>

          <Section
            title="Clutch"
            description="Most game-winning goals on drafted teams, then overtime goals"
          >
            {stats.clutch === null ? (
              <Unavailable />
            ) : (
              stats.clutch.map((player, i) => (
                <PlayerRow
                  key={`${player.id}-${player.team}`}
                  rank={i + 1}
                  player={player}
                  member={player.member}
                  value={player.gameWinningGoals}
                  unit="GWG"
                  detail={`${player.overtimeGoals} in overtime`}
                  highlight={mine(player.member)}
                />
              ))
            )}
          </Section>
        </Columns>
      </Box>
    </>
  );
};

const Stats = () => {
  const [person, setPerson] = useState<string>('everyone');
  const { profile } = useAuthentication();
  const { draft, draftId } = useDraft();

  const {
    data: stats,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['stats', draftId],
    queryFn: async () => (await api.get(`/hockey/stats?id=${draftId}`)).data.stats as DraftStats,
    enabled: !!draftId,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  if (!draft) {
    return <></>;
  }

  if (isLoading || isError || !stats || !profile) {
    return (
      <>
        <PageHeader title="Stats" />
        <Surface>
          {isLoading ? (
            <Center w="full" py="8">
              <Spinner size="xl" color="blue.500" />
            </Center>
          ) : (
            <Text p="4" color="inkMuted">
              Stats could not be loaded. Try again in a few minutes.
            </Text>
          )}
        </Surface>
      </>
    );
  }

  // everyone else in the draft, to compare yourself with
  const others = draft.members.filter((member) => member.id !== profile.id);
  const them = others.find((member) => member.id === person);

  return (
    <>
      <PageHeader title="Stats" />

      <Flex role="group" aria-label="Choose whose stats to see" wrap="wrap" gap="2">
        <FilterChip label="Everyone" pressed={!them} onClick={() => setPerson('everyone')} />
        {others.map((member) => (
          <FilterChip
            key={member.id}
            label={member.name}
            pressed={them?.id === member.id}
            onClick={() => setPerson(member.id)}
          />
        ))}
      </Flex>

      {them ? (
        <PersonView stats={stats} me={profile} them={them} />
      ) : (
        <Overview stats={stats} meId={profile.id} />
      )}

      <Text fontSize="11px" color="inkMuted">
        Player numbers come from the NHL and are regular season only. They update about every 15
        minutes.
      </Text>
    </>
  );
};

export default Stats;
