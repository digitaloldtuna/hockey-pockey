import { Flex, Grid, Heading, HStack, Image, Tag, Text, VStack } from '@chakra-ui/react';
import { Game, Profile } from '../constants/types';
import { getAvatarColour } from '../utils';

// get time in HH:MM (AM or PM)
function formatTime12(iso: string): string {
  const [hourStr, minuteStr] = iso.split('T')[1].split('+')[0].split(':');
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr;

  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;

  return `${hour}:${minute} ${ampm}`;
}

const GameCard = ({ fade = false, game }: { fade?: boolean; game: Game }) => {
  const badge = (member?: Profile) => {
    if (member) {
      return (
        <Tag.Root size="sm" colorPalette={getAvatarColour(member.id)}>
          <Tag.Label>{member.name}</Tag.Label>
        </Tag.Root>
      );
    }
    return (
      <Tag.Root size="sm" colorPalette={'yellow'}>
        <Tag.Label>unclaimed</Tag.Label>
      </Tag.Root>
    );
  };

  const middlePiece = (game: Game) => {
    if (game.gameStateId === 1) {
      return (
        <Heading size="3xl" opacity={fade ? 0.5 : 1}>
          {formatTime12(game.easternStartTime)}
        </Heading>
      );
    } else if (game.gameStateId === 2) {
      return (
        <>
          <Heading size="3xl" opacity={fade ? 0.5 : 1}>
            {game.homeScore} vs. {game.visitingScore}
          </Heading>
          <Text fontSize="sm" opacity={fade ? 0.5 : 1}>
            {formatTime12(game.easternStartTime)}
          </Text>
        </>
      );
    } else if (game.homeMember && game.visitingMember) {
      const winner = game.homeScore > game.visitingScore ? game.homeMember : game.visitingMember;
      return (
        <>
          <HStack align="center">
            <Text fontSize="sm" opacity={fade ? 0.5 : 1}>
              winner:
            </Text>
            {badge(winner)}
          </HStack>
          <Heading size="3xl" opacity={fade ? 0.5 : 1}>
            {game.homeScore} vs. {game.visitingScore}
          </Heading>
        </>
      );
    }
  };

  return (
    <Grid
      templateColumns="repeat(3, 1fr)"
      gap={4}
      padding="3"
      paddingX="5"
      rounded="2xl"
      backgroundColor={'white'}
      width="100%"
      borderWidth={game.gameStateId !== 1 && !fade ? '3px' : ''}
      borderColor={game.gameStateId === 2 ? 'orange' : 'brown'}
      opacity={fade ? 0.5 : 1}
    >
      <HStack>
        <Image src={game.homeTeam?.logo} boxSize="60px" fit="cover" alt={game.homeTeam?.fullName} />
        <VStack align="start" gap="1">
          <Heading size="sm">{game.homeTeam?.fullName}</Heading>
          {badge(game.homeMember)}
        </VStack>
      </HStack>

      <Flex align="center" justify="center" direction="column">
        {middlePiece(game)}
      </Flex>

      <HStack justify="end">
        <VStack align="end" gap="1">
          <Heading size="sm">{game.visitingTeam?.fullName}</Heading>
          {badge(game.visitingMember)}
        </VStack>
        <Image
          src={game.visitingTeam?.logo}
          boxSize="60px"
          fit="cover"
          alt={game.visitingTeam?.fullName}
        />
      </HStack>
    </Grid>
  );
};

export default GameCard;
