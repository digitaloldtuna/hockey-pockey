import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Grid,
  Heading,
  HStack,
  Image,
  Input,
  NativeSelect,
  StackSeparator,
  Tag,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useState } from 'react';
import { MOCKED_TEAMS } from '../../constants/mocks';
import { Draft, Team } from '../../constants/types';

const DivisionColour: Record<string, string> = {
  Metropolitan: 'red',
  Atlantic: 'green',
  Pacific: 'blue',
  Central: 'yellow',
};

const ConferenceColour: Record<string, string> = {
  Eastern: 'yellow',
  Western: 'red',
};

type Props = {
  draft: Draft;
};

const generateAssignmentBase = (teams: Team[]) => {
  return teams.map((team) => ({
    id: team.id,
    fullName: team.fullName,
    logo: team.logo,
    division: team.divisionName,
    conference: team.conferenceName,
    code: team.code,
    owner: undefined as string | undefined,
  }));
};

const TeamSelection = ({ draft }: Props) => {
  const [teams, setTeams] = useState(MOCKED_TEAMS);
  const [teamAssignments, setTeamAssignments] = useState(
    generateAssignmentBase(Object.values(teams))
  );

  const members = draft.members;

  const UnassignedTeams = () => {
    const unassignedTeams = teamAssignments.filter((ta) => !ta.owner);
    if (unassignedTeams.length > 0) {
      return (
        <Box width="stretch">
          <Heading size="lg">Unassigned Teams:</Heading>
          <AvatarGroup gap="0" spaceX="0" size="md">
            {unassignedTeams.map((team) => (
              <Avatar.Root key={team.code}>
                <Avatar.Fallback name={team.code} />
                <Avatar.Image src={team.logo} />
              </Avatar.Root>
            ))}
          </AvatarGroup>
        </Box>
      );
    }
    return <></>;
  };

  const handleSelectMember = ({ teamId, memberId }: { teamId: number; memberId: string }) => {
    setTeamAssignments((oldAssignments) =>
      oldAssignments.map((a) => {
        if (a.id === teamId) {
          return { ...a, owner: memberId };
        }
        return a;
      })
    );
  };

  const handleSaveDraft = () => {
    console.log('SAVING DRAFT', teamAssignments);
  };

  const handleStart = () => {
    console.log('STARTING DRAFT', teamAssignments);
  };

  return (
    <Box>
      <Grid templateColumns="repeat(2, 1fr)" gap="10">
        <Box rounded="2xl" backgroundColor="white" padding="5">
          <Text marginBottom="5">Assign a member for each team:</Text>
          <VStack gap="5" separator={<StackSeparator />}>
            {teamAssignments.map((team) => (
              <HStack width="stretch" justify="space-between">
                <HStack>
                  <Image src={team.logo} boxSize="60px" fit="cover" alt={team.fullName} />
                  <VStack>
                    <Heading size="md">{team.fullName}</Heading>
                    <HStack>
                      <Tag.Root size="sm" colorPalette={ConferenceColour[team.conference]}>
                        <Tag.Label>{team.conference}</Tag.Label>
                      </Tag.Root>
                      <Tag.Root size="sm" colorPalette={DivisionColour[team.division]}>
                        <Tag.Label>{team.division}</Tag.Label>
                      </Tag.Root>
                    </HStack>
                  </VStack>
                </HStack>
                <NativeSelect.Root size="sm" width="200px">
                  <NativeSelect.Field
                    placeholder="Select member"
                    onChange={(event) =>
                      handleSelectMember({ teamId: team.id, memberId: event.currentTarget.value })
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
        </Box>
        <Box rounded="2xl" backgroundColor="white" padding="5">
          <VStack gap="3">
            {members.map((member) => {
              const memberTeams = teamAssignments.filter((ta) => ta.owner === member.id);
              return (
                <Box width="stretch" key={member.id}>
                  <Heading size="lg">{member.name}'s Teams:</Heading>
                  {memberTeams.length === 0 ? (
                    <>No teams assigned to {member.name} yet.</>
                  ) : (
                    <AvatarGroup gap="0" spaceX="0" size="md">
                      {memberTeams.map((team) => (
                        <Avatar.Root key={team.code}>
                          <Avatar.Fallback name={team.code} />
                          <Avatar.Image src={team.logo} />
                        </Avatar.Root>
                      ))}
                    </AvatarGroup>
                  )}
                </Box>
              );
            })}
            <UnassignedTeams />
          </VStack>
        </Box>
      </Grid>
      <HStack gap="3" justify="flex-end" marginTop="5">
        <Button type="button" variant="outline" onClick={handleSaveDraft}>
          Save
        </Button>
        <Button type="button" onClick={handleStart}>
          Confirm and Start
        </Button>
      </HStack>
    </Box>
  );
};

export default TeamSelection;
