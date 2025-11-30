import { createContext, useContext, useState, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { Draft, Game, Standing } from '../constants/types';
import { toastError, toastSuccess } from '../theme/toaster';
import { useAuthentication } from './useAuthentication';

interface DraftContextType {
  draftId: string | null;
  setDraftId: (id: string | null) => void;

  draft: Draft | undefined;
  loading: boolean;
  error: unknown;

  upcomingGames: [string, Game[]][] | null;
  leaderboard: any[] | null;
  standings: Standing[] | null;
  history: [string, Game[]][] | null;

  refresh: () => void;
  isRefreshing: boolean;
}

const DraftContext = createContext<DraftContextType | undefined>(undefined);

export function DraftProvider({ children }: { children: ReactNode }) {
  const { session } = useAuthentication();
  const [draftId, setDraftId] = useState<string | null>(null);

  const [upcomingGames, setUpcomingGames] = useState<[string, Game[]][] | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[] | null>(null);
  const [standings, setStandings] = useState<Standing[] | null>(null);
  const [history, setHistory] = useState<[string, Game[]][] | null>(null);

  const fetchGamesForThisWeek = () => {
    if (!session?.authenticated || !draftId) return;
    api
      .get(`/hockey/games/thisweek?id=${draftId}`)
      .then((res) => {
        setUpcomingGames(res.data.games);
      })
      .catch((reason) => {
        setUpcomingGames(null);
        toastError('Cannot fetch upcoming games', reason);
      });
  };

  const fetchLeaderboard = () => {
    if (!session?.authenticated || !draftId) return;
    api
      .get(`/draft/leaderboard?id=${draftId}`)
      .then((res) => {
        setLeaderboard(res.data.leaderboard);
      })
      .catch((reason) => {
        setLeaderboard([]);
        toastError('Cannot fetch leaderboard for draft', reason);
      });
  };

  const fetchStandings = () => {
    if (!session?.authenticated || !draftId) return;
    api
      .get(`/hockey/standings?id=${draftId}`)
      .then((res) => {
        setStandings(res.data.standings);
      })
      .catch((reason) => {
        setStandings(null);
        toastError('Cannot fetching games for week', reason);
      });
  };

  const fetchHistory = () => {
    if (!session?.authenticated || !draftId) return;
    api
      .get(`/hockey/member/history?id=${draftId}`)
      .then((res) => {
        const sortedHistory = res.data.history.reverse();
        setHistory(sortedHistory);
      })
      .catch((reason) => {
        setHistory(null);
        toastError('Cannot fetching games for week', reason);
      });
  };

  const {
    data: draft,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ['draft', draftId],
    queryFn: async () => {
      const res = await api.get(`/draft?id=${draftId}`);
      fetchGamesForThisWeek();
      fetchLeaderboard();
      fetchStandings();
      fetchHistory();
      return res.data.draft as Draft;
    },
    enabled: !!draftId && session?.authenticated, // only fetch when there's a draftId
    retry: false,
  });

  // Show toast if error occurs
  if (error) {
    toastError(`Error fetching draft: ${error.message}`);
  }

  const {
    isFetching: isRefreshing,
    error: refreshError,
    refetch: refresh,
  } = useQuery({
    queryKey: ['refresh'],
    queryFn: async () => {
      const res = await api.post(`/hockey/refresh`);
      if (res.status === 200) {
        toastSuccess('Successfully refreshed hockey data.');
        fetchGamesForThisWeek();
        fetchLeaderboard();
        fetchStandings();
        fetchHistory();
        return true;
      }
      return false;
    },
    enabled: false,
    retry: false,
  });

  if (refreshError) {
    toastError('Error refreshing hockey data:', refreshError.message);
  }

  return (
    <DraftContext.Provider
      value={{
        draftId,
        setDraftId,
        draft,
        loading,
        error,
        upcomingGames,
        leaderboard,
        standings,
        history,
        refresh,
        isRefreshing,
      }}
    >
      {children}
    </DraftContext.Provider>
  );
}

export function useDraft() {
  const ctx = useContext(DraftContext);
  if (!ctx) throw new Error('useDraft must be used within DraftProvider');
  return ctx;
}
