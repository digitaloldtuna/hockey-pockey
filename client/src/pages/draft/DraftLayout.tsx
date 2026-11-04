import { Button, Flex, Text } from '@chakra-ui/react';
import Layout from '../Layout';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui';
import { ROUTES } from '../../constants/routes';

type Props = {
  title: string;
  // when given, the page gets an ice-lettered header with this text and the back button moves to the sidebar
  iceTitle?: string;
  children: React.ReactNode;
};

const DraftLayout = ({ title, iceTitle, children }: Props) => {
  const navigate = useNavigate();
  const goHome = () => navigate(ROUTES.HOME);

  return (
    <Layout back={iceTitle ? { label: 'All drafts', onClick: goHome } : undefined}>
      {iceTitle ? (
        <PageHeader title={iceTitle} />
      ) : (
        <Flex justify="start" align="center">
          <Button variant="plain" size="lg" padding="0" color="sidebarText" onClick={goHome}>
            <ArrowLeft />
          </Button>
          <Text as="h1" fontFamily="heading" fontSize="28px" fontWeight="bold" color="sidebarText">
            {title}
          </Text>
        </Flex>
      )}
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
