import { Button, Flex, Text } from '@chakra-ui/react';
import Layout from '../Layout';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

type Props = {
  title: string;
  children: React.ReactNode;
};

const DraftLayout = ({ title, children }: Props) => {
  const navigate = useNavigate();
  return (
    <Layout>
      <Flex justify="start" align="center">
        <Button variant="plain" size="lg" padding="0" onClick={() => navigate(ROUTES.HOME)}>
          <ArrowLeft />
        </Button>
        <Text as="h1" fontFamily="heading" fontSize="28px" fontWeight="bold">
          {title}
        </Text>
      </Flex>
      <Flex
        rounded="card"
        bg="card"
        border="1px solid"
        borderColor="line"
        padding={{ base: '4', md: '8' }}
        direction="column"
        gap="3"
      >
        {children}
      </Flex>
    </Layout>
  );
};

export default DraftLayout;
