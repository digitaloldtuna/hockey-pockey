import { Avatar, Flex, HStack, Image, Link, Table, Tag, Text, VStack } from '@chakra-ui/react';
import { useState } from 'react';
import api from '../../../api';
import { useDraft } from '../../../hooks/useDraft';
import { toastError } from '../../../theme/toaster';
import { Team, Profile } from '../../../constants/types';
import { getAvatarColour, getConferenceColour, getDivisionColour } from '../../../utils';
import { useAuthentication } from '../../../hooks/useAuthentication';

type Standing = Team & {
  member: Profile;
  wins: number;
  loses: number;
  lt: boolean[];
  streak: {
    type: 'w' | 'l';
    value: number;
  };
};

const formatLastTen = (record: boolean[]) => {
  let wins = 0;
  let loses = 0;
  record.forEach((won) => (won ? wins++ : loses++));

  return `${wins} - ${loses}`;
};

const Standings = () => {
  const [standings, setStandings] = useState<Standing[] | null>(null);
  const { profile } = useAuthentication();
  const { draft } = useDraft();
  if (!draft) {
    return <></>;
  }
  const fetchStandings = () => {
    api
      .get(`/hockey/standings?id=${draft.id}`)
      .then((res) => {
        setStandings(res.data.standings);
      })
      .catch((reason) => {
        setStandings(null);
        toastError('Cannot fetching games for week', reason);
      });
  };

  if (standings === null) {
    fetchStandings();
  }

  return (
    <Flex
      rounded="2xl"
      backgroundColor="whiteAlpha.500"
      padding="8"
      direction="column"
      height="36rem"
    >
      <Text marginBottom="3">
        {`This is specific to the current draft. To see total standings, check `}
        <Link href="https://www.nhl.com/standings/2025-11-28/league" target="_blank">
          the official NHL site
        </Link>
        .
      </Text>

      <Table.ScrollArea borderWidth="1px" rounded="md" height="100%">
        <Table.Root size="sm" stickyHeader>
          <Table.Header>
            <Table.Row bg="bg.subtle">
              <Table.ColumnHeader>Place</Table.ColumnHeader>
              <Table.ColumnHeader>Team</Table.ColumnHeader>
              <Table.ColumnHeader>Wins</Table.ColumnHeader>
              <Table.ColumnHeader>Loses</Table.ColumnHeader>
              <Table.ColumnHeader>L10</Table.ColumnHeader>
              <Table.ColumnHeader>Owner</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {standings &&
              standings.map((standing, i) => (
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
                      <Image
                        src={standing.logo}
                        boxSize="50px"
                        fit="cover"
                        alt={standing.fullName}
                      />
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
                          <Tag.Root
                            size="sm"
                            colorPalette={getDivisionColour(standing.divisionName)}
                          >
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
    </Flex>
  );
};

export default Standings;
