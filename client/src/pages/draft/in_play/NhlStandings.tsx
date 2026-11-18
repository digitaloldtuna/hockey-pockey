import { Box, Center, Flex, Image, Spinner, Table, Text } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../api';
import { DayHeader, Pill } from '../../../components/ui';
import { LeagueStanding } from '../../../constants/types';
import { useAuthentication } from '../../../hooks/useAuthentication';
import { useDraft } from '../../../hooks/useDraft';
import { memberColour, readableOn } from '../../../utils';

export type NhlView = 'league' | 'conference' | 'division';
type View = NhlView;

const HEADERS = [
  '#',
  'Team',
  'GP',
  'W',
  'L',
  'OTL',
  'PTS',
  'P%',
  'GF',
  'GA',
  'DIFF',
  'L10',
  'STRK',
  'Owner',
];

// fixed widths, so the separate conference and division tables line up with each other
const WIDTHS: Record<string, string> = { '#': '44px', Team: '240px', L10: '72px', Owner: '96px' };

const COLUMN_TITLES_BG = '#E3EAF2';

// what the NHL's clinch letters mean, for the key under the table
const CLINCHED: Record<string, string> = {
  p: "Presidents' Trophy",
  z: 'clinched conference',
  y: 'clinched division',
  x: 'clinched playoff spot',
  e: 'eliminated',
};

// point percentage is shown hockey style: .795
const pointPct = (value: number) => value.toFixed(3).replace(/^0/, '');
const signed = (value: number) => (value > 0 ? `+${value}` : `${value}`);

const rankIn = (view: View, team: LeagueStanding) =>
  view === 'league'
    ? team.leagueRank
    : view === 'conference'
      ? team.conferenceRank
      : team.divisionRank;

// one table for the whole league, or one per conference or division
const groupsFor = (view: View, standings: LeagueStanding[]): [string, LeagueStanding[]][] => {
  if (view === 'league') return [['NHL', standings]];
  const groups = new Map<string, LeagueStanding[]>();
  [...standings]
    .sort(
      (a, b) =>
        a.conference.localeCompare(b.conference) ||
        (view === 'division' ? a.division.localeCompare(b.division) : 0)
    )
    .forEach((team) => {
      const name = view === 'conference' ? team.conference : team.division;
      groups.set(name, [...(groups.get(name) ?? []), team]);
    });
  return Array.from(groups.entries()).map(([name, teams]) => [
    name,
    teams.sort((a, b) => rankIn(view, a) - rankIn(view, b)),
  ]);
};

const StandingsTable = ({
  view,
  teams,
  meId,
}: {
  view: View;
  teams: LeagueStanding[];
  meId?: string;
}) => (
  <Table.ScrollArea>
    <Table.Root size="sm" minW="860px" bg="transparent" tableLayout="fixed">
      <Table.Header>
        {/* lighter than the conference and division headings, so the two read as separate rows */}
        <Table.Row bg={COLUMN_TITLES_BG}>
          {HEADERS.map((header) => (
            <Table.ColumnHeader
              key={header}
              w={WIDTHS[header]}
              py="2"
              px="2.5"
              bg={COLUMN_TITLES_BG}
              color="ink"
              fontSize="11px"
              letterSpacing="0.08em"
              textTransform="uppercase"
              borderColor="line"
            >
              {header}
            </Table.ColumnHeader>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {teams.map((team) => {
          const mine = !!meId && team.member?.id === meId;
          const cell = { py: '1.5', px: '2.5', borderColor: 'lineSoft', fontWeight: 'bold' };
          return (
            <Table.Row
              key={team.code}
              bg={mine ? 'lavenderWash' : 'transparent'}
              transition="background .15s ease"
              _hover={{ bg: '#E4EDF6' }}
            >
              <Table.Cell {...cell} color="inkMuted">
                {rankIn(view, team)}
              </Table.Cell>
              <Table.Cell {...cell} fontWeight="normal">
                <Flex align="center" gap="2">
                  <Image src={team.logo} boxSize="28px" fit="contain" alt="" />
                  <Text fontWeight="semibold" fontSize="12px" whiteSpace="nowrap">
                    {team.clinched && (
                      <Text as="span" color="inkMuted" mr="1">
                        {team.clinched} -
                      </Text>
                    )}
                    {team.name}
                  </Text>
                </Flex>
              </Table.Cell>
              <Table.Cell {...cell}>{team.gamesPlayed}</Table.Cell>
              <Table.Cell {...cell}>{team.wins}</Table.Cell>
              <Table.Cell {...cell}>{team.losses}</Table.Cell>
              <Table.Cell {...cell}>{team.otLosses}</Table.Cell>
              <Table.Cell {...cell} fontSize="14px">
                {team.points}
              </Table.Cell>
              <Table.Cell {...cell}>{pointPct(team.pointPct)}</Table.Cell>
              <Table.Cell {...cell}>{team.goalsFor}</Table.Cell>
              <Table.Cell {...cell}>{team.goalsAgainst}</Table.Cell>
              <Table.Cell
                {...cell}
                color={
                  team.goalDifferential > 0
                    ? '#2F6B3A'
                    : team.goalDifferential < 0
                      ? '#A23B2A'
                      : 'ink'
                }
              >
                {signed(team.goalDifferential)}
              </Table.Cell>
              <Table.Cell {...cell} whiteSpace="nowrap">
                {team.lastTen}
              </Table.Cell>
              <Table.Cell {...cell}>{team.streak ?? '-'}</Table.Cell>
              <Table.Cell {...cell} fontWeight="normal">
                {team.member ? (
                  <Pill bg={memberColour(team.member)} color={readableOn(team.member.colour)}>
                    {team.member.name}
                  </Pill>
                ) : (
                  <Pill bg="ownerNone">Not drafted</Pill>
                )}
              </Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table.Root>
  </Table.ScrollArea>
);

// The NHL's own standings for the draft's season, in one table or one per conference or division.
// Loaded the first time it is shown, then kept while switching views.
const NhlStandings = ({ view }: { view: NhlView }) => {
  const { profile } = useAuthentication();
  const { draftId } = useDraft();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['league-standings', draftId],
    queryFn: async () =>
      (await api.get(`/hockey/league-standings?id=${draftId}`)).data as {
        updatedAt: string | null;
        standings: LeagueStanding[];
      },
    enabled: !!draftId,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const standings = data?.standings ?? [];
  const clinchKeys = Array.from(new Set(standings.map((t) => t.clinched).filter(Boolean)));

  if (isLoading) {
    return (
      <Center w="full" py="8">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }
  if (isError || standings.length === 0) {
    return (
      <Text p="4" color="inkMuted">
        The NHL standings could not be loaded. Try again in a few minutes.
      </Text>
    );
  }

  return (
    <>
      <Flex
        px="14px"
        py="2"
        gap="2"
        justify="space-between"
        wrap="wrap"
        fontSize="11px"
        color="inkMuted"
      >
        <Text>The official NHL table, with who drafted each team.</Text>
        <Text>
          {data?.updatedAt
            ? `As of ${new Date(data.updatedAt).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}`
            : 'Final regular-season standings'}
        </Text>
      </Flex>
      {groupsFor(view, standings).map(([name, teams]) => (
        <Box key={name}>
          {view !== 'league' && <DayHeader title={name} right={`${teams.length} teams`} />}
          <StandingsTable view={view} teams={teams} meId={profile?.id} />
        </Box>
      ))}
      {clinchKeys.length > 0 && (
        <Text
          px="14px"
          py="2"
          fontSize="11px"
          color="inkMuted"
          borderTop="1px solid"
          borderColor="lineSoft"
        >
          {clinchKeys.map((key) => `${key} - ${CLINCHED[key!] ?? key}`).join(' · ')}
        </Text>
      )}
    </>
  );
};

export default NhlStandings;
