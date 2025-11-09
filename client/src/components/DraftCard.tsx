import { Avatar, AvatarGroup, Box, Flex, Tag, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { DraftStatusLabel } from '../constants/mappings';
import { Draft } from '../constants/types';

const colorPalette = ['red', 'blue', 'yellow', 'purple', 'orange'];

const pickPalette = (name: string) => {
  const index = name.charCodeAt(0) % colorPalette.length;
  return colorPalette[index];
};

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

  let members: { id: string; name: string }[] = draft.members;
  let lastMember = undefined;
  if (membersLength > 5) {
    members = draft.members.slice(0, 4);
    lastMember = { name: `+${membersLength - 4}` };
  }

  return (
    <Box
      rounded="2xl"
      backgroundColor="white"
      width="sm"
      padding="5"
      _hover={{
        shadow: 'sm',
        cursor: 'pointer',
      }}
      onClick={() => navigate(`/draft/${draft.id}`)}
    >
      <Flex justify="space-between" align="center">
        <Text fontWeight="bold" fontSize="xl" marginBottom="1">
          {draft.name}
        </Text>
        <Text>
          <Tag.Root size="sm" colorPalette={DraftStatusToColour[draft.status]}>
            <Tag.Label>{DraftStatusLabel[draft.status]}</Tag.Label>
          </Tag.Root>
        </Text>
      </Flex>
      <Flex justify="space-between">
        <AvatarGroup gap="0" spaceX="0" size="xs">
          {members.map((member) => (
            <Avatar.Root colorPalette={pickPalette(member.id)}>
              <Avatar.Fallback name={member.name} />
            </Avatar.Root>
          ))}
          {lastMember && (
            <Avatar.Root>
              <Avatar.Fallback>{lastMember.name}</Avatar.Fallback>
            </Avatar.Root>
          )}
        </AvatarGroup>
        <Text fontSize="lg">{draft.season}</Text>
      </Flex>
    </Box>
  );
};

export default DraftCard;
