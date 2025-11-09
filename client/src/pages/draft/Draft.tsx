import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MOCKED_DRAFTS } from '../../constants/mocks';
import ClosedDraft from './ClosedDraft';
import DraftLayout from './DraftLayout';
import InPlayDraft from './InPlayDraft';
import OpenDraft from './OpenDraft';

const Draft = () => {
  const { draftId } = useParams<{ draftId: string }>();
  const [draft, setDraft] = useState((draftId && MOCKED_DRAFTS[draftId]) || null);

  const page = () => {
    if (!draft) {
      return <></>;
    }

    if (draft.status === 'open') {
      return (
        <DraftLayout title={draft.name}>
          <OpenDraft draft={draft} />
        </DraftLayout>
      );
    } else if (draft.status === 'closed') {
      return (
        <DraftLayout title={draft.name}>
          <ClosedDraft draft={draft} />
        </DraftLayout>
      );
    } else if (draft.status === 'in_play') {
      return <InPlayDraft draft={draft} />;
    }
    return <></>;
  };

  return <>{draft ? page() : `No draft found with the ID ${draftId}`}</>;
};

export default Draft;
