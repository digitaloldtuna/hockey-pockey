import { AbsoluteCenter } from '@chakra-ui/react';
import { Draft } from '../../constants/types';

type Props = {
  draft: Draft;
};

const InPlayDraft = ({ draft }: Props) => {
  return <AbsoluteCenter>🚧 This page is under constructions 🚧</AbsoluteCenter>;
};

export default InPlayDraft;
