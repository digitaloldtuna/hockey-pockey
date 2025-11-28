import {
  Avatar,
  Box,
  Button,
  Clipboard,
  Grid,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  Stack,
  Tag,
  Text,
} from '@chakra-ui/react';
import { useAuthentication } from '../../hooks/useAuthentication';
import { Draft } from '../../constants/types';
import { Tooltip } from '../../theme/tooltip';
import { X } from 'lucide-react';
import api from '../../api';
import { useState } from 'react';
import { getAvatarColour } from '../../utils';

type Props = {
  draft: Draft;
};

const OpenDraft = ({ draft }: Props) => {
  const { profile } = useAuthentication();
  const [members, setMembers] = useState(
    draft.members.map((member) => ({
      id: member.id,
      owner: (draft.owner && draft.owner === member.id) || false,
      name: member.name,
      email: member.email || '',
    }))
  );
  const isOwner = profile && draft.owner ? profile.id === draft.owner : false;

  const CloseDraftButton = () => {
    const button = (
      <Button width="auto" disabled={!isOwner} onClick={handleCloseDraft}>
        Close the draft
      </Button>
    );
    if (isOwner) {
      return button;
    }
    return (
      <Tooltip showArrow content="Contact the owner to close the draft.">
        {button}
      </Tooltip>
    );
  };

  const CodeField = () => {
    return (
      <Clipboard.Root value={draft.code}>
        <Text fontWeight="bold">Draft Code:</Text>
        <InputGroup
          endElement={
            <Clipboard.Trigger asChild>
              <IconButton variant="surface" size="xs" me="-2">
                <Clipboard.Indicator />
              </IconButton>
            </Clipboard.Trigger>
          }
        >
          <Clipboard.Input asChild>
            <Input
              disabled
              backgroundColor="white"
              _disabled={{
                opacity: 1, // prevent it from fading out
                cursor: 'auto',
              }}
            />
          </Clipboard.Input>
        </InputGroup>
      </Clipboard.Root>
    );
  };

  const handleCloseDraft = async () => {
    if (!isOwner) {
      return;
    }
    try {
      await api.post('/draft/close', { draftId: draft.id }).then((res) => {
        window.location.reload();
      });
    } catch (err) {}
    console.log('CLOSING DRAFT', draft.id);
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!isOwner) {
      return;
    }
    try {
      await api.post('/draft/remove', { draftId: draft.id, memberId }).then((res) => {
        console.log('REMOVED MEMBER ', memberId);
        setMembers((oldMembers) => oldMembers.filter((member) => member.id === memberId));
      });
    } catch (err) {}
    console.log('REMOVING MEMBER', memberId);
  };

  return (
    <Grid templateColumns="repeat(2, 1fr)" gap="10">
      <Box rounded="2xl" backgroundColor="white" padding="5">
        <Stack direction="column" gap="3">
          This draft is for the {draft.season} season.
          <CodeField />
          <Text marginBottom="3">
            This draft is still <b>open</b>. Close the draft to start picking teams!
          </Text>
          <CloseDraftButton />
        </Stack>
      </Box>
      <Box rounded="2xl" backgroundColor="white" padding="5">
        <Stack>
          <Heading>Current Members:</Heading>
          <Stack gap="5">
            {members.map((member) => (
              <HStack key={member.name} justify="space-between">
                <HStack gap="4">
                  <Avatar.Root colorPalette={getAvatarColour(member.id)}>
                    <Avatar.Fallback name={member.name} />
                  </Avatar.Root>
                  <Stack gap="0">
                    <HStack>
                      <Text fontWeight="medium">{member.name}</Text>
                      {member.owner && (
                        <Tag.Root size="sm" gap="3" colorPalette={'red'}>
                          <Tag.Label>owner</Tag.Label>
                        </Tag.Root>
                      )}
                    </HStack>
                    <Text color="fg.muted" textStyle="sm">
                      {member.email}
                    </Text>
                  </Stack>
                </HStack>
                {isOwner && !member.owner && (
                  <Tooltip content={`remove ${member.name} from draft`}>
                    <Icon
                      _hover={{ cursor: 'pointer' }}
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      <X />
                    </Icon>
                  </Tooltip>
                )}
              </HStack>
            ))}
          </Stack>
        </Stack>
      </Box>
    </Grid>
  );
};

export default OpenDraft;
