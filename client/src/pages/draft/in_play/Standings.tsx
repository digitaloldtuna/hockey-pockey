import { VStack } from '@chakra-ui/react';
import { useState } from 'react';
import { useDraft } from '../../../hooks/useDraft';

const Standings = () => {
  const [standings, setStandings] = useState<any[] | null>(null);
  const { draft } = useDraft();
  if (!draft) {
    return <></>;
  }

  //   const fetchLeaderboard = () => {
  //     api
  //       .get(`/draft/leaderboard?id=${draft.id}`)
  //       .then((res) => {
  //         setLeaderboard(res.data.leaderboard);
  //       })
  //       .catch((reason) => {
  //         setLeaderboard([]);
  //         toastError('Error fetching leaderboard for draft', reason);
  //       });
  //   };

  //   if (leaderboard === null) {
  //     fetchLeaderboard();
  //   }

  return <VStack></VStack>;
};

export default Standings;
