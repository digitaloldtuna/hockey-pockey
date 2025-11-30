import { Button, Flex, Tabs, Text, useBreakpointValue, VStack } from '@chakra-ui/react';
import Layout from '../Layout';
import { ROUTES } from '../../constants/routes';
import { ArrowLeft, ChartBar, History, Home, RefreshCcw, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { InPlayHistory, InPlayHome, InPlayStandings, InPlayStats } from './in_play';
import { useDraft } from '../../hooks/useDraft';

const formatLastRefreshed = (date?: Date) => {
  if (!date) {
    return <></>;
  }
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
};

const InPlayDraft = () => {
  const navigate = useNavigate();
  const orientation = useBreakpointValue<'horizontal' | 'vertical'>({
    base: 'horizontal',
    md: 'vertical',
  });
  const { draft, refresh, isRefreshing, envVariables } = useDraft();
  if (!draft) {
    return <></>;
  }

  return (
    <Layout>
      <Flex justify="start" align="center" w="full" h="full">
        <Button
          variant="plain"
          size={{ base: 'lg', md: '2xl' }}
          padding="0"
          onClick={() => navigate(ROUTES.HOME)}
        >
          <ArrowLeft />
        </Button>
        <Text
          fontSize={{ base: '2xl', md: '4xl' }}
          color="oxford"
          fontFamily="heading"
          lineHeight="1"
        >
          <b>{draft.name}</b>
          {draft.season}
        </Text>
      </Flex>
      <Tabs.Root
        defaultValue="home"
        variant="plain"
        orientation={orientation}
        size={{ base: 'sm', md: 'lg' }}
        overflowY="visible"
      >
        <VStack position={{ base: 'auto', md: 'sticky' }} top="5" height="fit-content">
          <Flex
            justify={{ base: 'space-between', md: 'start' }}
            align="center"
            direction={{ base: 'row', md: 'column' }}
            gap="3"
            height="fit-content"
          >
            <Tabs.List bg="whiteAlpha.500" rounded="2xl" p="1">
              <Tabs.Trigger value="home" p="3">
                <Home />
                {orientation === 'vertical' && 'Home'}
              </Tabs.Trigger>
              <Tabs.Trigger value="standings">
                <Users />
                {orientation === 'vertical' && 'Standings'}
              </Tabs.Trigger>
              <Tabs.Trigger value="stats">
                <ChartBar />
                {orientation === 'vertical' && 'Stats'}
              </Tabs.Trigger>
              <Tabs.Trigger value="history">
                <History />
                {orientation === 'vertical' && 'History'}
              </Tabs.Trigger>
              <Tabs.Indicator rounded="2xl" />
            </Tabs.List>
            <Button
              rounded="2xl"
              colorPalette="oxford"
              variant="surface"
              onClick={refresh}
              disabled={isRefreshing}
              w={{ base: 'auto', md: '100%' }}
            >
              <RefreshCcw size={20} className={isRefreshing ? 'rotate' : ''} />
              {isRefreshing ? 'refreshing' : 'refresh'}
            </Button>
          </Flex>
          <Text fontSize={{ base: '2xs', md: '2xs' }} opacity="0.5">
            updated {formatLastRefreshed(envVariables?.lastRefreshed)}
          </Text>
        </VStack>

        <Tabs.Content value="home" w="full">
          <InPlayHome />
        </Tabs.Content>
        <Tabs.Content value="standings" w="full">
          <InPlayStandings />
        </Tabs.Content>
        <Tabs.Content value="stats" w="full">
          <InPlayStats />
        </Tabs.Content>
        <Tabs.Content value="history" w="full">
          <InPlayHistory />
        </Tabs.Content>
      </Tabs.Root>
    </Layout>
  );
};

export default InPlayDraft;
