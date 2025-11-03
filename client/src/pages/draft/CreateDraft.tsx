import { Avatar, AvatarGroup, Box, Flex, Link, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import Layout from '../Layout';
import api from '../../api';
import { useAuthentication } from '../../hooks/useAuthentication';

const CreateDraft = () => {
  const { handleLogout } = useAuthentication();

  return (
    <Layout>
      <Flex justify="space-between" align="end" marginTop="10">
        <Text fontSize="5xl" color="oxford">
          <b>create</b> a draft!
        </Text>
      </Flex>
      <Flex rounded="2xl" backgroundColor="whiteAlpha.500" padding="8"></Flex>
      <Flex justify="center">
        <Link color="highElfBlue" onClick={handleLogout}>
          logout
        </Link>
      </Flex>
    </Layout>
  );
};

export default CreateDraft;
