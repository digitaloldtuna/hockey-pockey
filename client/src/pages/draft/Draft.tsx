import { AbsoluteCenter, Heading, Link, Spinner, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';
import { Draft as DraftType } from '../../constants/types';
import ClosedDraft from './ClosedDraft';
import DraftLayout from './DraftLayout';
import InPlayDraft from './InPlayDraft';
import OpenDraft from './OpenDraft';
import TeamSelection from './TeamSelection';

const Draft = () => {
  const navigate = useNavigate();
  const { draftId } = useParams<{ draftId: string }>();
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<DraftType | null>(null);

  useEffect(() => {
    async function fetchDraft() {
      setLoading(true);
      api
        .get(`/draft?id=${draftId}`)
        .then((res) => {
          console.log('RES', res);
          setDraft(res.data.draft);
          setLoading(false);
        })
        .catch((reason) => {
          console.log('Error fetching draft', reason);
          setLoading(false);
        });
    }
    fetchDraft();
  }, []);

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
