import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Draft as DraftType } from '../../constants/types';
import DraftLayout from './DraftLayout';
import InPlayDraft from './InPlayDraft';
import OpenDraft from './OpenDraft';

const MOCKED_DRAFT: DraftType = {
  id: '1',
  name: 'Open Draft',
  season: 2026,
  status: 'open',
  members: [
    { id: '1', name: 'Mai' },
    { id: '2', name: 'Adele' },
    { id: '3', name: 'Amy' },
    { id: '4', name: 'Sophie' },
  ],
  code: '124356',
  owner: { id: '1', name: 'Mai' },
};

const Draft = () => {
  const { draftId } = useParams<{ draftId: string }>();
  const [draft, setDraft] = useState(MOCKED_DRAFT);

  const page = () => {
    if (!draft) {
      return <></>;
    }

    if (draft.status === 'open') {
      return <OpenDraft draft={draft} />;
    } else if (draft.status === 'closed') {
      console.log('not implemented'); // TO DO
      return <></>;
    } else if (draft.status === 'in_play') {
      return <InPlayDraft draft={draft} />;
    }
    return <></>;
  };

  return <DraftLayout title={draft.name}>{page()}</DraftLayout>;
};

export default Draft;
