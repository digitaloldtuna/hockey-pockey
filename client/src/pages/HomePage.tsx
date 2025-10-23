import api from '../api';
import { Avatar, AvatarGroup, Box, Button, Flex, Link, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { Profile } from '../constants/types';
import Layout from './Layout';
import { Plus, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);

  if (!profile) {
    api
      .get<{ profile: Profile }>('/profile')
      .then((res) => {
        setProfile(res.data.profile);
      })
      .catch((e) => console.debug('cannot find profile:', e));
  }

  const handleLogout = (e: any) => {
    api.post('/authentication/logout').then((res) => {
      navigate('/login');
    });
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
          <Button rounded="2xl" colorPalette="oxford" variant="surface">
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
