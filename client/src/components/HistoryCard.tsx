import {
  Flex,
  Grid,
  Heading,
  HStack,
  Image,
  Tag,
  Text,
  useBreakpointValue,
  VStack,
} from '@chakra-ui/react';
import { Game, Profile } from '../constants/types';
import { useAuthentication } from '../hooks/useAuthentication';
import { memberColour, readableOn } from '../utils';

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

const HistoryCard = ({ game }: { game: Game }) => {
  const isBase = useBreakpointValue({ base: true, md: false });

  const { profile } = useAuthentication();
  const sameOwner =
    game.homeMember?.id && game.visitingMember?.id && game.visitingMember.id === game.homeMember.id;
  const won =
    !sameOwner &&
    ((profile?.id === game.homeMember?.id && game.homeScore > game.visitingScore) ||
      (profile?.id === game.visitingMember?.id && game.homeScore < game.visitingScore));
  const lost =
    !sameOwner &&
    ((profile?.id === game.homeMember?.id && game.homeScore < game.visitingScore) ||
      (profile?.id === game.visitingMember?.id && game.homeScore > game.visitingScore));

  const badge = (member?: Profile) => {
    return (
      <Tag.Root
        size="sm"
        height="18px"
        minH="0"
        fontSize="10px"
        bg={memberColour(member)}
        color={readableOn(member?.colour)}
      >
        <Tag.Label>{member ? member.name : 'unclaimed'}</Tag.Label>
      </Tag.Root>
    );
  };

  const middlePiece = (game: Game) => {
    return (
      <>
        <Heading size={{ base: 'lg', md: 'xl' }}>
          {game.homeScore} vs. {game.visitingScore}
        </Heading>
        <Text fontSize="2xs">{formatTime12(game.easternStartTime)}</Text>
      </>
    );
  };

  let backgroundColor = 'white';
  let borderColor = 'gray';
  if (won) {
    backgroundColor = '#f2fcf2';
    borderColor = '#4ccf51';
  } else if (lost) {
    backgroundColor = '#fcf2f2';
    borderColor = '#cf4c4c';
  }

  return (
    <Grid
      templateColumns="repeat(3, 1fr)"
      paddingY="1.5"
      paddingX={{ base: '2', md: '3' }}
      rounded="xl"
      borderWidth="2px"
      borderColor={borderColor}
      backgroundColor={backgroundColor}
      opacity={won || lost ? 1 : 0.6}
      width="100%"
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

export default HistoryCard;
