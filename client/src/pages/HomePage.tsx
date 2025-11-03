import { Avatar, AvatarGroup, Box, Button, Flex, Link, Text } from '@chakra-ui/react';
import Layout from './Layout';
import { Plus, UserPlus } from 'lucide-react';
import { useAuthentication } from '../hooks/useAuthentication';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

const HomePage = () => {
  const { profile, handleLogout } = useAuthentication();
  const navigate = useNavigate();

  const handleCreateDraft = () => {
    navigate(ROUTES.DRAFT.CREATE);
  };

  return (
    <Layout>
      <Flex justify="space-between" align="end" marginTop="10">
        <Flex gap="5" align="center">
          <Avatar.Root colorPalette="red" size="xl">
            <Avatar.Fallback name={profile?.name[0] || ''} />
          </Avatar.Root>
          <Text fontSize="5xl" color="oxford">
            Welcome, <b>{profile?.name}</b>!
          </Text>
        </Flex>
        <Flex gap="2" marginBottom="2">
          <Button rounded="2xl" colorPalette="oxford" variant="surface">
            <UserPlus />
            Join a draft
          </Button>
          <Button rounded="2xl" colorPalette="oxford" variant="surface" onClick={handleCreateDraft}>
            <Plus />
            Create a draft
          </Button>
        </Flex>
      </Flex>
      <Flex rounded="2xl" backgroundColor="whiteAlpha.500" padding="8">
        <Box
          rounded="2xl"
          backgroundColor="white"
          width="xs"
          padding="5"
          _hover={{
            shadow: 'sm',
            cursor: 'pointer',
          }}
        >
          <Text fontWeight="bold" fontSize="xl">
            Draft Name
          </Text>
          <Flex justify="space-between">
            <AvatarGroup gap="0" spaceX="-2" size="xs">
              <Avatar.Root>
                <Avatar.Fallback name="Mai" />
              </Avatar.Root>
              <Avatar.Root>
                <Avatar.Fallback name="Adele" />
              </Avatar.Root>
              <Avatar.Root>
                <Avatar.Fallback name="Amy" />
              </Avatar.Root>
              <Avatar.Root>
                <Avatar.Fallback name="Sophie" />
              </Avatar.Root>
            </AvatarGroup>
            <Text fontSize="lg">2026</Text>
          </Flex>
        </Box>
      </Flex>
      <Flex justify="center">
        <Link color="highElfBlue" onClick={handleLogout}>
          logout
        </Link>
      </Flex>
    </Layout>
  );
};

export default HomePage;
