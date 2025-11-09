import { Center } from '@chakra-ui/react';
import { Draft } from '../../constants/types';

type Props = {
  draft: Draft;
};

const ClosedDraft = ({ draft }: Props) => {
  return (
    <Center>
      <b>🚧 PAGE IS UNDER CONSTRUCTION 🚧</b>
    </Center>
  );
};

export default ClosedDraft;
