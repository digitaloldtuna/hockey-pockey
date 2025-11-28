import { VStack } from '@chakra-ui/react';
import { useDraft } from '../../../hooks/useDraft';

const History = () => {
  const { draft } = useDraft();
  if (!draft) {
    return <></>;
  }

  return <VStack></VStack>;
};

export default History;
