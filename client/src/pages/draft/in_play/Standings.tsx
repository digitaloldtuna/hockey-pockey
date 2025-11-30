import {
  Avatar,
  Center,
  Flex,
  HStack,
  Image,
  Link,
  Spinner,
  Table,
  Tag,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useDraft } from '../../../hooks/useDraft';
import { Profile, Standing } from '../../../constants/types';
import { getAvatarColour, getConferenceColour, getDivisionColour } from '../../../utils';
import { useAuthentication } from '../../../hooks/useAuthentication';

const formatLastTen = (record: boolean[]) => {
  let wins = 0;
  let loses = 0;
  record.forEach((won) => (won ? wins++ : loses++));

  return `${wins} - ${loses}`;
};

const StandingsTable = ({ standings, profile }: { standings: Standing[]; profile: Profile }) => {
  return (
    <Table.ScrollArea>
      <Table.Root size="sm" stickyHeader>
        <Table.Header>
          <Table.Row bg="bg.subtle">
            <Table.ColumnHeader>Place</Table.ColumnHeader>
            <Table.ColumnHeader>Team</Table.ColumnHeader>
            <Table.ColumnHeader>Wins</Table.ColumnHeader>
            <Table.ColumnHeader>Loses</Table.ColumnHeader>
            <Table.ColumnHeader>L10</Table.ColumnHeader>
            <Table.ColumnHeader>Win Rate</Table.ColumnHeader>
            <Table.ColumnHeader>Owner</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {standings.map((standing, i) => (
            <Table.Row
              key={standing.id}
              backgroundColor={profile && standing.member.id === profile.id ? '#f7fcfc' : ''}
            >
              <Table.Cell>
                <HStack>
                  {i + 1}
                  {profile && standing.member.id === profile.id && <Text>⭐</Text>}
                </HStack>
              </Table.Cell>
              <Table.Cell>
                <HStack margin="2" gap="3">
                  <Image src={standing.logo} boxSize="50px" fit="cover" alt={standing.fullName} />
                  <VStack align="start">
                    <Text fontWeight="bold" fontSize="sm">
                      {standing.fullName}
                    </Text>
                    <HStack>
                      <Tag.Root
                        size="sm"
                        colorPalette={getConferenceColour(standing.conferenceName)}
                      >
                        <Tag.Label>{standing.conferenceName}</Tag.Label>
                      </Tag.Root>
                      <Tag.Root size="sm" colorPalette={getDivisionColour(standing.divisionName)}>
                        <Tag.Label>{standing.divisionName}</Tag.Label>
                      </Tag.Root>
                    </HStack>
                  </VStack>
                </HStack>
              </Table.Cell>
              <Table.Cell>
                <Text fontSize="md" fontWeight="bold">
                  {standing.wins}
                </Text>
              </Table.Cell>
              <Table.Cell>
                <Text fontSize="md" fontWeight="bold">
                  {standing.loses}
                </Text>
              </Table.Cell>
              <Table.Cell>
                <Text fontSize="md" fontWeight="bold">
                  {formatLastTen(standing.lt)}
                </Text>
              </Table.Cell>
              <Table.Cell>
                <Text fontSize="md" fontWeight="bold">
                  {standing.win_rate}%
                </Text>
              </Table.Cell>
              <Table.Cell>
                <HStack>
                  <Avatar.Root colorPalette={getAvatarColour(standing.member.id)}>
                    <Avatar.Fallback name={standing.member.name} />
                    <Avatar.Image src={standing.member.profileImage || undefined} />
                  </Avatar.Root>
                  <Tag.Root size="lg" colorPalette={getAvatarColour(standing.member.id)}>
                    <Tag.Label>{standing.member.name}</Tag.Label>
                  </Tag.Root>
                </HStack>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  );
};

const Standings = () => {
  const { profile } = useAuthentication();
  const { draft, standings } = useDraft();
  if (!draft) {
    return <></>;
  }

  return (
    <Flex
      rounded="2xl"
      backgroundColor="whiteAlpha.500"
      padding={{ base: '3', md: '8' }}
      direction="column"
      h="full"
      w="full"
    >
      <Text marginBottom="3" fontSize={{ base: 'xs', md: 'sm' }}>
        {`This is specific to the current draft. To see total standings, check `}
        <Link href="https://www.nhl.com/standings/2025-11-28/league" target="_blank">
          the official NHL site
        </Link>
        .
      </Text>
      {standings && profile ? (
        <StandingsTable standings={standings} profile={profile} />
      ) : (
        <Center w="full" h="full">
          <Spinner size="xl" color="blue.500" />
        </Center>
      )}
    </Flex>
  );
};

export default Standings;
