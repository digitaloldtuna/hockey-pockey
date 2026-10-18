import { Box, Text } from '@chakra-ui/react';
import { ChartBar, Copy, History, Home, RefreshCcw, Users } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { NavItem } from '../../components/ui';
import { useDraft } from '../../hooks/useDraft';
import { toastSuccess } from '../../theme/toaster';
import Layout from '../Layout';
import { InPlayHistory, InPlayHome, InPlayStandings, InPlayStats } from './in_play';

type Tab = 'home' | 'standings' | 'stats' | 'history';

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

const CONTENT: Record<Tab, ReactNode> = {
  home: <InPlayHome />,
  standings: <InPlayStandings />,
  stats: <InPlayStats />,
  history: <InPlayHistory />,
};

const InPlayDraft = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('home');
  const { draft, refresh, isRefreshing, envVariables } = useDraft();
  if (!draft) {
    return <></>;
  }

  const item = (key: Tab, label: string, icon: ReactNode): NavItem => ({
    key,
    label,
    icon,
    active: tab === key,
    onClick: () => setTab(key),
  });

  const copyCode = () => {
    if (!draft.code) return;
    navigator.clipboard?.writeText(draft.code);
    toastSuccess('Invite code copied.');
  };

  const league = (
    <Box p="12px" rounded="14px" bg="sidebarRaised" border="1px solid #7F95AE">
      <Text fontFamily="heading" fontWeight="bold" fontSize="14px" wordBreak="break-word">
        {draft.name}
      </Text>
      <Text mt="2px" mb="10px" fontSize="11px" color="sidebarMuted">
        {draft.season} · {draft.members.length} {draft.members.length === 1 ? 'player' : 'players'}
      </Text>
      {draft.code && (
        <Box
          as="button"
          aria-label={`Copy invite code ${draft.code}`}
          title={draft.code}
          onClick={copyCode}
          w="full"
          mb="2"
          display="flex"
          alignItems="center"
          gap="2"
          minH="44px"
          px="12px"
          rounded="10px"
          border="1px solid #5E7189"
          bg="mist"
          color="ink"
          fontSize="11px"
          cursor="pointer"
          transition="background .15s ease"
          _hover={{ bg: '#D5DEE7' }}
        >
          <span>Invite</span>
          <Text
            as="span"
            flex="1"
            minW="0"
            textAlign="right"
            fontWeight="bold"
            fontSize="12px"
            letterSpacing="0.06em"
            truncate
          >
            {draft.code}
          </Text>
          <Box as="span" flex="none" display="flex">
            <Copy size={14} />
          </Box>
        </Box>
      )}
      <Box
        as="button"
        onClick={() => !isRefreshing && refresh()}
        aria-disabled={isRefreshing}
        w="full"
        display="flex"
        alignItems="center"
        justifyContent="center"
        gap="2"
        minH="44px"
        rounded="10px"
        border="1px solid #16263A"
        bg="ownerYellow"
        color="ink"
        fontWeight="bold"
        fontSize="12px"
        cursor={isRefreshing ? 'progress' : 'pointer'}
        opacity={isRefreshing ? 0.7 : 1}
        transition="background .15s ease"
        _hover={{ bg: '#F2D56A' }}
      >
        <RefreshCcw size={16} className={isRefreshing ? 'rotate' : ''} />
        {isRefreshing ? 'Refreshing scores...' : 'Refresh scores'}
      </Box>
      <Text mt="1.5" fontSize="10px" color="sidebarMuted" textAlign="center">
        Updated {formatLastRefreshed(envVariables?.lastRefreshed)}
      </Text>
    </Box>
  );

  return (
    <Layout
      aside={league}
      back={{ label: 'All drafts', onClick: () => navigate(ROUTES.HOME) }}
      nav={[
        item('home', 'Home', <Home size={18} />),
        item('standings', 'Standings', <Users size={18} />),
        item('stats', 'Stats', <ChartBar size={18} />),
        item('history', 'History', <History size={18} />),
      ]}
    >
      {CONTENT[tab]}
    </Layout>
  );
};

export default InPlayDraft;
