import {
  Avatar,
  Box,
  Button,
  Center,
  Flex,
  Grid,
  Heading,
  HStack,
  Image,
  NativeSelect,
  ScrollArea,
  Spinner,
  StackSeparator,
  Tag,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import api from '../../api';
import { Draft, Team } from '../../constants/types';
import { useAuthentication } from '../../hooks/useAuthentication';
import { getConferenceColour, getDivisionColour } from '../../utils';

type Props = {
  draft: Draft;
};

const TeamSelection = ({ draft }: Props) => {
  const { profile } = useAuthentication();
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState<Record<number, Team>>({});

  useEffect(() => {
    async function fetchTeams() {
      setLoading(true);
      api
        .get('/hockey/team/all')
        .then((res: any) => {
          console.log('TEAM RES', res);
          const rawTeams = res.data.teams;
          const teamObject = rawTeams.reduce((acc: Record<number, Team>, currentValue: Team) => {
            return {
              ...acc,
              [currentValue.id]: { ...currentValue, owner: null },
            };
          }, {});
          setTeams(teamObject);
          setLoading(false);
        })
        .catch((reason: any) => {
          console.log('Error fetching teams', reason);
          setLoading(false);
        });
    }
    fetchTeams();
  }, []);

  const isOwner = profile && draft.owner ? profile.id === draft.owner : false;

  const members = draft.members;

  const teamAssignments = useMemo(() => {
    return members.map((member) => {
      const memberTeams = Object.values(teams).filter((ta) => ta.owner === member.id);
      return (
        <Box width="stretch" key={member.id}>
          <Heading size="lg">{member.name}'s Teams:</Heading>
          {memberTeams.length === 0 ? (
            <>No teams assigned to {member.name} yet.</>
          ) : (
            <Flex gap="1" wrap="wrap" maxW="500px">
              {memberTeams.map((team) => (
                <Avatar.Root key={team.code}>
                  <Avatar.Fallback name={team.code} />
                  <Avatar.Image src={team.logo} />
                </Avatar.Root>
              ))}
            </Flex>
          )}
        </Box>
      );
    });
  }, [teams, members]);

  const unassignedTeams = useMemo(() => {
    const unassignedTeams = Object.values(teams).filter((ta: Team) => !ta.owner);
    if (unassignedTeams.length > 0) {
      return (
        <Box width="stretch">
          <Heading size="lg">Unassigned Teams:</Heading>
          <Flex gap="1" wrap="wrap" maxW="500px">
            {unassignedTeams.map((team) => (
              <Avatar.Root key={team.code}>
                <Avatar.Fallback name={team.code} />
                <Avatar.Image src={team.logo} />
              </Avatar.Root>
            ))}
          </Flex>
        </Box>
      );
    }
    return <></>;
  }, [teams]);

  const handleSelectMember = ({ teamId, memberId }: { teamId: number; memberId: string }) => {
    setTeams((oldTeams) => {
      return {
        ...oldTeams,
        [teamId]: {
          ...oldTeams[teamId],
          owner: memberId,
        },
      };
    });
  };

  const handleStart = async () => {
    try {
      const teamAssignments = Object.values(teams).map((assignment) => ({
        teamId: assignment.id,
        memberId: assignment.owner,
      }));

      await api.post('/draft/submit', { draftId: draft.id, teamAssignments }).then((res) => {
        console.log('SUBMIT RES', res);
        window.location.reload();
      });
    } catch (e) {
      console.log('ERROR:', e);
    }
  };

  return (
    <Box>
      <Grid templateColumns="repeat(2, 1fr)" gap="10">
        <Box rounded="2xl" backgroundColor="white" padding="5">
          <Text marginBottom="5">Assign a member for each team:</Text>
          <ScrollArea.Root height="25rem" variant="hover">
            <ScrollArea.Viewport>
              <ScrollArea.Content paddingEnd="3" textStyle="sm">
                <VStack gap="5" separator={<StackSeparator />}>
                  {loading && (
                    <Center>
                      <Spinner size="xl" color="blue.500" />
                    </Center>
                  )}
                  {!loading &&
                    Object.values(teams).map((team) => (
                      <HStack width="stretch" justify="space-between">
                        <HStack>
                          <Image src={team.logo} boxSize="60px" fit="cover" alt={team.fullName} />
                          <Flex justify="start" direction="column" gap="1">
                            <Heading size="md">{team.fullName}</Heading>
                            <HStack>
                              <Tag.Root
                                size="sm"
                                colorPalette={getConferenceColour(team.conferenceName)}
                              >
                                <Tag.Label>{team.conferenceName}</Tag.Label>
                              </Tag.Root>
                              <Tag.Root
                                size="sm"
                                colorPalette={getDivisionColour(team.divisionName)}
                              >
                                <Tag.Label>{team.divisionName}</Tag.Label>
                              </Tag.Root>
                            </HStack>
                          </Flex>
                        </HStack>
                        <NativeSelect.Root size="sm" width="200px" disabled={!isOwner}>
                          <NativeSelect.Field
                            placeholder="Select member"
                            onChange={(event) =>
                              handleSelectMember({
                                teamId: team.id,
                                memberId: event.currentTarget.value,
                              })
                            }
                          >
                            {members.map((member) => (
                              <option value={member.id} key={member.id}>
                                {member.name}
                              </option>
                            ))}
                          </NativeSelect.Field>
                          <NativeSelect.Indicator />
                        </NativeSelect.Root>
                      </HStack>
                    ))}
                </VStack>
              </ScrollArea.Content>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar />
          </ScrollArea.Root>
        </Box>
        <Box rounded="2xl" backgroundColor="white" padding="5">
          <VStack gap="3">
            {teamAssignments}
            {unassignedTeams}
          </VStack>
        </Box>
      </Grid>
      {isOwner && (
        <HStack justify="flex-end" marginTop="5">
          <Button type="button" onClick={handleStart}>
            Confirm and Start
          </Button>
        </HStack>
      )}
      {!isOwner && (
        <Center>
          <Text marginTop="3">to start the draft, contact the draft owner</Text>
        </Center>
      )}
    </Box>
  );
};

export default TeamSelection;
