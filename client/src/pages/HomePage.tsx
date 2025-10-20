import api from '../api';
import { Heading, VStack } from '@chakra-ui/react';
import { useState } from 'react';
import { Profile } from '../constants/types';

const HomePage = () => {
  const [profile, setProfile] = useState<Profile | null>(null);

  if (!profile) {
    api
      .get<{ profile: Profile }>('/profile')
      .then((res) => {
        setProfile(res.data.profile);
      })
      .catch((e) => console.debug('cannot find profile:', e));
  }

  return (
    <VStack>
      <Heading size="2xl">
        <>Welcome, {profile?.name}!</>
      </Heading>
    </VStack>
  );
};

export default HomePage;
