import {
  Flex,
  Grid,
  Heading,
  HStack,
  Image,
  Stack,
  Tag,
  Text,
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
      <Tag.Root
        size="sm"
        height="18px"
        minH="0"
        fontSize="10px"
        colorPalette={member ? getAvatarColour(member.id) : 'yellow'}
      >
        <Tag.Label>{member ? member.name : 'unclaimed'}</Tag.Label>
      </Tag.Root>
    );
  };

  const middlePiece = (game: Game) => {
    if (game.gameStateId === 1) {
      return (
        <Heading size={{ base: 'lg', md: 'xl' }}>{formatTime12(game.easternStartTime)}</Heading>
      );
    } else if (game.gameStateId === 7) {
      const winner = game.homeScore > game.visitingScore ? game.homeMember : game.visitingMember;
      return (
        <>
          <Stack align="center" direction={isBase ? 'column' : 'row'} gap={{ base: '0', md: '1' }}>
            <Text fontSize="2xs">winner:</Text>
            {badge(winner)}
          </Stack>
          <Heading size={{ base: 'lg', md: 'xl' }}>
            {game.homeScore} vs. {game.visitingScore}
          </Heading>
        </>
      );
    } else {
      return (
        <>
          <Heading size={{ base: 'lg', md: 'xl' }}>
            {game.homeScore} vs. {game.visitingScore}
          </Heading>
          <Text fontSize="2xs">{formatTime12(game.easternStartTime)}</Text>
        </>
      );
    }
  };

  return (
    <Grid
      templateColumns={{ base: '1fr 2fr 1fr', md: 'repeat(3, 1fr)' }}
      gap={2}
      paddingY="1.5"
      paddingX={{ base: '2', md: '3' }}
      rounded="xl"
      backgroundColor={'white'}
      width="100%"
      opacity={fade ? 0.6 : 1}
      borderWidth={game.gameStateId !== 1 && !fade ? '2px' : ''}
      borderColor={game.gameStateId !== 7 ? 'orange' : 'brown'}
    >
      <HStack>
        <Image
          src={game.homeTeam?.logo}
          boxSize={{ base: '28px', md: '38px' }}
          fit="cover"
          alt={game.homeTeam?.fullName}
        />
        <VStack align="start" gap="0.5">
          <Heading size="xs">{isBase ? game.homeTeam?.code : game.homeTeam?.fullName}</Heading>
          {badge(game.homeMember)}
        </VStack>
      </HStack>

      <Flex align="center" justify="center" direction="column">
        {middlePiece(game)}
      </Flex>

      <HStack justify="end">
        <VStack align="end" gap="0.5">
          <Heading size="xs" textAlign="right">
            {isBase ? game.visitingTeam?.code : game.visitingTeam?.fullName}
          </Heading>
          {badge(game.visitingMember)}
        </VStack>
        <Image
          src={game.visitingTeam?.logo}
          boxSize={{ base: '28px', md: '38px' }}
          fit="cover"
          alt={game.visitingTeam?.fullName}
        />
      </HStack>
    </Grid>
  );
};

export default GameCard;
