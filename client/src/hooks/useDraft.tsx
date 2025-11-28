import { createContext, useContext, useState, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { Draft } from '../constants/types';
import { toastError } from '../theme/toaster';

interface DraftContextType {
  draftId: string | null;
  setDraftId: (id: string | null) => void;

  draft: Draft | undefined;
  loading: boolean;
  error: unknown;
}

const DraftContext = createContext<DraftContextType | undefined>(undefined);

export function DraftProvider({ children }: { children: ReactNode }) {
  const [draftId, setDraftId] = useState<string | null>(null);

  const {
    data: draft,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ['draft', draftId],
    queryFn: async () => {
      const res = await api.get(`/draft?id=${draftId}`);
      return res.data.draft as Draft;
    },
    enabled: !!draftId, // only fetch when there's a draftId
    retry: false,
  });

  // Show toast if error occurs
  if (error) {
    toastError(`Error fetching draft: ${error}`);
  }

  return (
    <DraftContext.Provider
      value={{
        draftId,
        setDraftId,
        draft,
        loading,
        error,
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
