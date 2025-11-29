import { Avatar, AvatarGroup, Box, Flex, Tag, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { DraftStatusLabel } from '../constants/mappings';
import { Draft } from '../constants/types';
import { getAvatarColour } from '../utils';

const DraftStatusToColour = {
  open: 'yellow',
  closed: 'red',
  team_selection: 'purple',
  in_play: 'green',
};

type Props = {
  draft: Draft;
};

const DraftCard = ({ draft }: Props) => {
  const navigate = useNavigate();

  const membersLength = draft.members.length;

  let members = draft.members;
  let lastMember = undefined;

  if (membersLength > 5) {
    members = draft.members.slice(0, 4);
    lastMember = { name: `+${membersLength - 4}` };
  }

  return (
    <Box
      rounded="2xl"
      backgroundColor="white"
      w="100%"
      width={{ base: '100%', md: 'xs' }}
      p={{ base: 3, md: 5 }}
      h="fit-content"
      _hover={{
        shadow: 'md',
        cursor: 'pointer',
      }}
      onClick={() => navigate(`/draft/${draft.id}`)}
    >
      {/* Title + status */}
      <Flex justify="space-between" align="center" mb="2">
        <Text fontWeight="bold" fontSize={{ base: 'lg', md: 'xl' }}>
          {draft.name}
        </Text>

        <Tag.Root size="sm" colorPalette={DraftStatusToColour[draft.status]}>
          <Tag.Label>{DraftStatusLabel[draft.status]}</Tag.Label>
        </Tag.Root>
      </Flex>

      {/* Avatars + season */}
      <Flex justify="space-between" align="center">
        <AvatarGroup spaceX={{ base: '-2', md: '0' }} size="sm">
          {members.map((member) => (
            <Avatar.Root key={member.id} colorPalette={getAvatarColour(member.id)}>
              <Avatar.Fallback name={member.name} />
              <Avatar.Image src={member.profileImage || undefined} />
            </Avatar.Root>
          ))}

          {lastMember && (
            <Avatar.Root>
              <Avatar.Fallback>{lastMember.name}</Avatar.Fallback>
            </Avatar.Root>
          )}
        </AvatarGroup>

        <Text fontSize={{ base: 'sm', md: 'lg' }} fontWeight="medium">
          {draft.season}
        </Text>
      </Flex>
    </Box>
  );
};

export default DraftCard;
