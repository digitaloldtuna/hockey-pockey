import {
  Flex,
  Grid,
  Heading,
  HStack,
  Image,
  Stack,
  Tag,
  Text,
  useBreakpoint,
  useBreakpointValue,
  VStack,
} from '@chakra-ui/react';
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
  const isBase = useBreakpointValue({ base: true, md: false });

  const badge = (member?: Profile) => {
    return (
      <Tag.Root size="sm" colorPalette={member ? getAvatarColour(member.id) : 'yellow'}>
        <Tag.Label>{member ? member.name : 'unclaimed'}</Tag.Label>
      </Tag.Root>
    );
  };

  const middlePiece = (game: Game) => {
    if (game.gameStateId === 1) {
      return (
        <Heading size={{ base: '2xl', md: '3xl' }} opacity={fade ? 0.5 : 1}>
          {formatTime12(game.easternStartTime)}
        </Heading>
      );
    } else if (game.gameStateId === 7) {
      const winner = game.homeScore > game.visitingScore ? game.homeMember : game.visitingMember;
      return (
        <>
          <Stack align="center" direction={isBase ? 'column' : 'row'} gap={{ base: '0', md: '1' }}>
            <Text fontSize={{ base: 'xs', md: 'sm' }} opacity={fade ? 0.5 : 1}>
              winner:
            </Text>
            {badge(winner)}
          </Stack>
          <Heading size={{ base: '2xl', md: '3xl' }} opacity={fade ? 0.5 : 1}>
            {game.homeScore} vs. {game.visitingScore}
          </Heading>
        </>
      );
    } else {
      return (
        <>
          <Heading size={{ base: '2xl', md: '3xl' }} opacity={fade ? 0.5 : 1}>
            {game.homeScore} vs. {game.visitingScore}
          </Heading>
          <Text fontSize={{ base: 'xs', md: 'sm' }} opacity={fade ? 0.5 : 1}>
            {formatTime12(game.easternStartTime)}
          </Text>
        </>
      );
    }
  };

  return (
    <Grid
      templateColumns={{ base: '1fr 2fr 1fr', md: 'repeat(3, 1fr)' }}
      gap={4}
      padding="3"
      paddingX={{ base: '3', md: '5' }}
      rounded="2xl"
      backgroundColor={'white'}
      width="100%"
      borderWidth={game.gameStateId !== 1 && !fade ? '3px' : ''}
      borderColor={game.gameStateId !== 7 ? 'orange' : 'brown'}
      opacity={fade ? 0.5 : 1}
    >
      <HStack>
        <Image
          src={game.homeTeam?.logo}
          boxSize={{ base: '35px', md: '60px' }}
          fit="cover"
          alt={game.homeTeam?.fullName}
        />
        <VStack align="start" gap="1">
          <Heading size="sm">{isBase ? game.homeTeam?.code : game.homeTeam?.fullName}</Heading>
          {badge(game.homeMember)}
        </VStack>
      </HStack>

      <Flex align="center" justify="center" direction="column">
        {middlePiece(game)}
      </Flex>

      <HStack justify="end">
        <VStack align="end" gap="1">
          <Heading size="sm" textAlign="right">
            {isBase ? game.visitingTeam?.code : game.visitingTeam?.fullName}
          </Heading>
          {badge(game.visitingMember)}
        </VStack>
        <Image
          src={game.visitingTeam?.logo}
          boxSize={{ base: '35px', md: '60px' }}
          fit="cover"
          alt={game.visitingTeam?.fullName}
        />
      </HStack>
    </Grid>
  );
};

export default GameCard;
