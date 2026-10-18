import { Avatar, Box, Center, Grid, Image, Link, Spinner, Table, Text } from '@chakra-ui/react';
import { PageHeader, Pill, StatTile, Surface } from '../../../components/ui';
import { Profile, Standing } from '../../../constants/types';
import { useAuthentication } from '../../../hooks/useAuthentication';
import { useDraft } from '../../../hooks/useDraft';
import { getOwnerColour } from '../../../utils';

const formatLastTen = (record: boolean[]) => {
  const wins = record.filter(Boolean).length;
  return `${wins} - ${record.length - wins}`;
};

const HEADERS = ['#', 'Team', 'W', 'L', 'L10', 'Win %', 'Owner'];

const StandingsTable = ({ standings, profile }: { standings: Standing[]; profile: Profile }) => (
  <Table.ScrollArea>
    <Table.Root size="sm" stickyHeader minW="560px" bg="transparent">
      <Table.Header>
        <Table.Row bg="lineSoft">
          {HEADERS.map((header) => (
            <Table.ColumnHeader
              key={header}
              py="2"
              px="3"
              bg="lineSoft"
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
        {standings.map((standing, i) => {
          const mine = standing.member.id === profile.id;
          return (
            <Table.Row
              key={standing.id}
              bg={mine ? 'pinkWash' : 'transparent'}
              transition="background .15s ease"
              _hover={{ bg: '#E4EDF6' }}
            >
              <Table.Cell py="1.5" px="3" borderColor="lineSoft" fontWeight="bold" color="inkMuted">
                {i + 1}
              </Table.Cell>
              <Table.Cell py="1.5" px="3" borderColor="lineSoft">
                <Box display="flex" alignItems="center" gap="2">
                  <Image
                    src={standing.logo}
                    boxSize={{ base: '28px', md: '36px' }}
                    fit="contain"
                    alt=""
                  />
                  <Box minW="0">
                    <Text fontWeight="semibold" fontSize="12px">
                      {standing.fullName}
                    </Text>
                    <Text fontSize="10px" color="inkMuted">
                      {standing.conferenceName} · {standing.divisionName}
                    </Text>
                  </Box>
                </Box>
              </Table.Cell>
              <Table.Cell py="1.5" px="3" borderColor="lineSoft" fontWeight="bold">
                {standing.wins}
              </Table.Cell>
              <Table.Cell py="1.5" px="3" borderColor="lineSoft" fontWeight="bold">
                {standing.loses}
              </Table.Cell>
              <Table.Cell py="1.5" px="3" borderColor="lineSoft" fontWeight="bold">
                {formatLastTen(standing.lt)}
              </Table.Cell>
              <Table.Cell py="1.5" px="3" borderColor="lineSoft" fontWeight="bold">
                {standing.win_rate}%
              </Table.Cell>
              <Table.Cell py="1.5" px="3" borderColor="lineSoft">
                <Box display="flex" alignItems="center" gap="2">
                  <Avatar.Root
                    size="xs"
                    flex="none"
                    border="1px solid #4B6079"
                    bg={getOwnerColour(standing.member.id)}
                    color="ink"
                  >
                    <Avatar.Fallback name={standing.member.name} />
                    <Avatar.Image src={standing.member.profileImage || undefined} />
                  </Avatar.Root>
                  <Pill bg={getOwnerColour(standing.member.id)}>{standing.member.name}</Pill>
                </Box>
              </Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table.Root>
  </Table.ScrollArea>
);

const Standings = () => {
  const { profile } = useAuthentication();
  const { draft, standings } = useDraft();
  if (!draft) {
    return <></>;
  }

  const mine = standings?.filter((s) => s.member.id === profile?.id) ?? [];
  const best = standings?.reduce<Standing | undefined>(
    (top, s) => (!top || s.win_rate > top.win_rate ? s : top),
    undefined
  );

  return (
    <>
      <PageHeader title="Standings" note="Teams in this draft" />

      <Grid templateColumns="repeat(auto-fit, minmax(min(180px, 100%), 1fr))" gap="3">
        <StatTile
          label="Your teams"
          value={mine.length}
          sub={`${mine.reduce((sum, s) => sum + s.wins, 0)} wins combined`}
          bg="ownerPink"
        />
        <StatTile
          label="Teams drafted"
          value={standings?.length ?? '-'}
          sub={`${draft.members.length} players`}
          bg="ownerBlue"
          delay="0.08s"
        />
        <StatTile
          label="Best win rate"
          value={best ? `${best.win_rate}%` : '-'}
          sub={best?.fullName}
          bg="ownerMint"
          delay="0.16s"
        />
      </Grid>

      <Surface as="section" aria-label="Standings">
        <Text px="14px" py="2" fontSize="11px" color="inkMuted">
          This is specific to the current draft. To see total standings, check{' '}
          <Link href="https://www.nhl.com/standings/2025-11-28/league" target="_blank">
            the official NHL site
          </Link>
          .
        </Text>
        {standings && profile ? (
          <StandingsTable standings={standings} profile={profile} />
        ) : (
          <Center w="full" py="8">
            <Spinner size="xl" color="blue.500" />
          </Center>
        )}
      </Surface>
    </>
  );
};

export default Standings;
