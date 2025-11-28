import { Box, Flex, Grid, Heading, HStack, Image, Tag, Text, VStack } from '@chakra-ui/react';
import { Game, Profile } from '../constants/types';
import { getAvatarColour } from '../utils';

const GameCard = ({ fade, game }: { fade: boolean; game: Game }) => {
  const badge = (notCounted: boolean, member?: Profile) => {
    if (member) {
      return (
        <Tag.Root
          size="sm"
          colorPalette={getAvatarColour(member.id)}
          opacity={notCounted ? 0.5 : 1}
        >
          <Tag.Label>{member.name}</Tag.Label>
        </Tag.Root>
      );
    }
    return (
      <Tag.Root size="sm" colorPalette={'yellow'} opacity={notCounted ? 0.5 : 1}>
        <Tag.Label>unclaimed</Tag.Label>
      </Tag.Root>
    );
  };

  return (
    <Grid
      templateColumns="repeat(3, 1fr)"
      gap={4}
      padding="3"
      paddingX="5"
      rounded="2xl"
      backgroundColor={fade ? 'whiteAlpha.600' : 'white'}
      width="100%"
    >
      <VStack align="start" gap="1">
        <Image
          src={game.homeTeam?.logo}
          boxSize="60px"
          fit="cover"
          alt={game.homeTeam?.fullName}
          opacity={fade ? 0.5 : 1}
        />
        <Heading size="sm" opacity={fade ? 0.5 : 1}>
          {game.homeTeam?.fullName}
        </Heading>
        {badge(fade, game.homeMember)}
      </VStack>

      <Flex align="center" justify="center">
        <Heading size="2xl" opacity={fade ? 0.5 : 1}>
          {game.homeScore} vs. {game.visitingScore}
        </Heading>
      </Flex>

      <VStack align="end" gap="1">
        <Image
          src={game.visitingTeam?.logo}
          boxSize="60px"
          fit="cover"
          alt={game.visitingTeam?.fullName}
          opacity={fade ? 0.5 : 1}
        />
        <Heading size="sm" opacity={fade ? 0.5 : 1}>
          {game.visitingTeam?.fullName}
        </Heading>
        {badge(fade, game.visitingMember)}
      </VStack>
    </Grid>
  );
};

export default GameCard;
