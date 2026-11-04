import { Avatar, Box, Flex, Text } from '@chakra-ui/react';
import { memberColour, placements, readableOn } from '../utils';

export type LeaderboardEntry = {
  id: string;
  name: string;
  email?: string;
  profileImage?: string;
  colour?: string;
  score: number;
};

// ranked rows for a leaderboard that is already sorted best-first; tied scores share a place
const LeaderboardList = ({ entries, meId }: { entries: LeaderboardEntry[]; meId?: string }) => {
  const places = placements(entries, (entry) => entry.score);

  return (
    <Flex as="ol" direction="column" gap="1.5" listStyleType="none" m="0" p="0">
      {entries.map((member, i) => (
        <Flex
          as="li"
          key={member.id}
          align="center"
          gap="10px"
          px="10px"
          py="1.5"
          rounded="12px"
          border="1px solid #B3C1D0"
          bg={member.id === meId ? 'lavenderWash' : 'white'}
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
  );
};

export default LeaderboardList;
