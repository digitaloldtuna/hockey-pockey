import { Avatar, Flex, Grid, Heading, HStack, Text } from '@chakra-ui/react';
import { useState } from 'react';
import api from '../../../api';
import { useDraft } from '../../../hooks/useDraft';
import { toastError } from '../../../theme/toaster';

const Stats = () => {
  return <Grid templateColumns="repeat(2, 1fr)" gap="10"></Grid>;
};

export default Stats;
