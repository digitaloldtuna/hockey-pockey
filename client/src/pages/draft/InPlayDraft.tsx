import {
  AbsoluteCenter,
  Avatar,
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  HStack,
  Tag,
  Text,
} from '@chakra-ui/react';
import Layout from '../Layout';
import { Draft } from '../../constants/types';
import { ROUTES } from '../../constants/routes';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DRAFT_LEADERBOARD } from '../../constants/mocks';
import { useState } from 'react';
import api from '../../api';
import { toastError } from '../../theme/toaster';

const colorPalette = ['red', 'blue', 'yellow', 'purple', 'orange'];

const pickPalette = (name: string) => {
  const index = name.charCodeAt(0) % colorPalette.length;
  return colorPalette[index];
};

type Props = {
  draft: Draft;
};

const InPlayDraft = ({ draft }: Props) => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<any[] | null>(null);

  const fetchLeaderboard = () => {
    api
      .get(`/draft/leaderboard?id=${draft.id}`)
      .then((res) => {
        setLeaderboard(res.data.leaderboard);
      })
      .catch((reason) => {
        setLeaderboard([]);
        toastError('Error fetching leaderboard for draft', reason);
      });
  };

  if (leaderboard === null) {
    fetchLeaderboard();
  }

  return (
    <Layout>
      <Flex justify="start" align="center">
        <Button
          variant="plain"
          size="2xl"
          gap="8"
          padding="0"
          onClick={() => navigate(ROUTES.HOME)}
        >
          <ArrowLeft />
        </Button>
        <Text fontSize="3xl" color="oxford">
          <b>{draft.name} </b>
          {draft.season}
        </Text>
      </Flex>
      <Grid templateColumns="repeat(2, 1fr)" gap="10">
        {/* UPCOMING GAMES */}
        <Flex rounded="2xl" backgroundColor="whiteAlpha.500" padding="8" direction="column" gap="3">
          <Text fontSize="2xl" color="oxford">
            upcoming games
          </Text>
        </Flex>

        {/* LEADERBOARD */}
        <Flex rounded="2xl" backgroundColor="whiteAlpha.500" padding="8" direction="column" gap="3">
          <Text fontSize="2xl" color="oxford">
            leaderboard
          </Text>
          <Flex direction="column" gap="3">
            {leaderboard &&
              leaderboard.map((member) => (
                <Flex
                  justify="space-between"
                  padding="3"
                  paddingX="5"
                  rounded="2xl"
                  backgroundColor="whiteAlpha.500"
                  alignItems="center"
                >
                  <HStack gap="3">
                    <Avatar.Root colorPalette={pickPalette(member.name)}>
                      <Avatar.Fallback name={member.name} />
                    </Avatar.Root>
                    <Heading size="md">{member.name}</Heading>
                  </HStack>
                  <Heading size="xl">{member.score}</Heading>
                </Flex>
              ))}
          </Flex>
        </Flex>
      </Grid>
    </Layout>
  );
};

export default InPlayDraft;
