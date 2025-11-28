import { AbsoluteCenter, Heading, Link, Spinner, VStack } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDraft } from '../../hooks/useDraft';
import { useTitle } from '../../hooks/useTitle';
import ClosedDraft from './ClosedDraft';
import DraftLayout from './DraftLayout';
import InPlayDraft from './InPlayDraft';
import OpenDraft from './OpenDraft';
import TeamSelection from './TeamSelection';

const Draft = () => {
  const navigate = useNavigate();
  const { draftId } = useParams<{ draftId: string }>();
  const { loading, draft, setDraftId } = useDraft();

  useTitle(draft?.name || 'Loading');

  useEffect(() => {
    const noDraft = !draft && draftId;
    const newDraft = draft && draftId && draftId != draft?.id;

    if ((noDraft || newDraft) && !loading) {
      setDraftId(draftId);
    }
  }, [draftId, draft]);

  const page = () => {
    if (!draft) {
      return (
        <AbsoluteCenter>
          <VStack>
            <Heading>No draft found 😶‍🌫️</Heading>
            <Link onClick={() => navigate('/')}>go back home</Link>
          </VStack>
        </AbsoluteCenter>
      );
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
    } else {
      return (
        <DraftLayout title={draft.name}>
          <TeamSelection draft={draft} />
        </DraftLayout>
      );
    }
  };

  return (
    <>
      {loading ? (
        <AbsoluteCenter>
          <Spinner size="xl" color="blue.500" />
        </AbsoluteCenter>
      ) : (
        page()
      )}
    </>
  );
};

export default Draft;
