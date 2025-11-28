import { VStack } from '@chakra-ui/react';
import { useDraft } from '../../../hooks/useDraft';

const Standings = () => {
  const { draft } = useDraft();
  if (!draft) {
    return <></>;
  }

  return <VStack></VStack>;
};

export default Standings;
