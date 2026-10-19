import { Box, Flex, Text } from '@chakra-ui/react';

const MESSAGES = [
  'PICK YOUR TEAMS',
  'WATCH THE POINTS PILE UP',
  'A SIMPLE NHL DRAFT WITH YOUR FRIENDS',
  'CLAIM TEAMS',
  'FOLLOW THE GAMES',
  "SEE WHO'S ON TOP",
];

// a full-width scrolling LED sign, like the boards at a hockey arena
const LedTicker = ({ edge, reverse = false }: { edge: 'top' | 'bottom'; reverse?: boolean }) => (
  <Box
    role="marquee"
    aria-label={MESSAGES.join('. ')}
    position="absolute"
    left="0"
    right="0"
    top={edge === 'top' ? '0' : undefined}
    bottom={edge === 'bottom' ? '0' : undefined}
    zIndex="2"
    overflow="hidden"
    py="2"
    bg="#0a0e13"
    borderTop={edge === 'bottom' ? '3px solid #2b3643' : undefined}
    borderBottom={edge === 'top' ? '3px solid #2b3643' : undefined}
    boxShadow="inset 0 0 18px rgba(0,0,0,0.8)"
  >
    <Flex className={reverse ? 'ticker-track ticker-reverse' : 'ticker-track'} aria-hidden="true">
      {[0, 1].map((copy) => (
        <Flex key={copy} flex="none">
          {MESSAGES.map((message) => (
            <Text
              key={message}
              as="span"
              px="6"
              fontWeight="bold"
              fontSize={{ base: '15px', md: '20px' }}
              letterSpacing="0.14em"
              whiteSpace="nowrap"
              color="#ffc24d"
              textShadow="0 0 6px rgba(255, 176, 46, 0.85), 0 0 14px rgba(255, 140, 20, 0.45)"
            >
              {message} <span style={{ opacity: 0.6, paddingLeft: '1.5rem' }}>◆</span>
            </Text>
          ))}
        </Flex>
      ))}
    </Flex>
    {/* LED pixel grid */}
    <Box
      position="absolute"
      inset="0"
      pointerEvents="none"
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0) 1px, rgba(8,11,15,0.32) 1.7px)',
        backgroundSize: '3px 3px',
      }}
    />
  </Box>
);

export default LedTicker;
