import { Button, Flex, Link, Text } from '@chakra-ui/react';
import Layout from '../Layout';
import { useAuthentication } from '../../hooks/useAuthentication';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

type Props = {
  title: string;
  children: React.ReactNode;
};

const DraftLayout = ({ title, children }: Props) => {
  const navigate = useNavigate();
  const { handleLogout } = useAuthentication();
  return (
    <Layout marginX="10">
      <Flex justify="start" align="center" marginTop="10">
        <Button
          variant="plain"
          size="2xl"
          gap="8"
          padding="0"
          onClick={() => navigate(ROUTES.HOME)}
        >
          <ArrowLeft />
        </Button>
        <Text fontSize="5xl" color="oxford" fontWeight="bold">
          {title}
        </Text>
      </Flex>
      <Flex rounded="2xl" backgroundColor="whiteAlpha.500" padding="8" direction="column" gap="3">
        {children}
      </Flex>
      <Flex justify="center">
        <Link color="highElfBlue" onClick={handleLogout}>
          logout
        </Link>
      </Flex>
    </Layout>
  );
};

export default DraftLayout;
