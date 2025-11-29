import { Button, Flex, Tabs, Text } from '@chakra-ui/react';
import Layout from '../Layout';
import { Draft } from '../../constants/types';
import { ROUTES } from '../../constants/routes';
import { ArrowLeft, ChartBar, History, Home, RefreshCcw, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { toastError, toastSuccess } from '../../theme/toaster';
import { InPlayHistory, InPlayHome, InPlayStandings, InPlayStats } from './in_play';

type Props = {
  draft: Draft;
};

const InPlayDraft = ({ draft }: Props) => {
  const navigate = useNavigate();

  const handleRefreshData = () => {
    api
      .post(`/hockey/refresh`)
      .then((res) => {
        toastSuccess('Successfully refreshed hockey data.');
      })
      .catch((reason) => {
        toastError('Error refreshing hockey data', reason);
      });
  };

  return (
    <Layout>
      <Flex justify="start" align="center">
        <Button
          variant="plain"
          size="2xl"
          gap="8"
          padding="0"
          onClick={() => navigate(ROUTES.HOME)}
        >
          <ArrowLeft />
        </Button>
        <Text fontSize="4xl" color="oxford" fontFamily="heading">
          <b>{draft.name} </b>
          {draft.season}
        </Text>
      </Flex>
      <Tabs.Root defaultValue="home" variant="plain">
        <Flex justify="space-between" align="center">
          <Tabs.List bg="whiteAlpha.500" rounded="2xl" p="1">
            <Tabs.Trigger value="home" p="3">
              <Home />
              Home
            </Tabs.Trigger>
            <Tabs.Trigger value="standings">
              <Users />
              Standings
            </Tabs.Trigger>
            <Tabs.Trigger value="stats">
              <ChartBar />
              Stats
            </Tabs.Trigger>
            <Tabs.Trigger value="history">
              <History />
              History
            </Tabs.Trigger>
            <Tabs.Indicator rounded="2xl" />
          </Tabs.List>
          <Button rounded="2xl" colorPalette="oxford" variant="surface" onClick={handleRefreshData}>
            <RefreshCcw />
            refresh
          </Button>
        </Flex>

        <Tabs.Content value="home">
          <InPlayHome />
        </Tabs.Content>
        <Tabs.Content value="standings">
          <InPlayStandings />
        </Tabs.Content>
        <Tabs.Content value="stats">
          <InPlayStats />
        </Tabs.Content>
        <Tabs.Content value="history">
          <InPlayHistory />
        </Tabs.Content>
      </Tabs.Root>
    </Layout>
  );
};

export default InPlayDraft;
