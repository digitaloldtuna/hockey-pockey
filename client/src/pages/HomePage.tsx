import api from '../api';
import { AbsoluteCenter, Heading } from '@chakra-ui/react';
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
    <AbsoluteCenter>
      <Heading size="2xl">
        <>Welcome, {profile?.name}!</>
      </Heading>
    </AbsoluteCenter>
  );
};

export default HomePage;
