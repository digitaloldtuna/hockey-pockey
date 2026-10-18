import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FrostOverlay, PuckMark, Snowflake } from '../../components/ui';
import { ROUTES } from '../../constants/routes';

interface AuthLayoutProps {
  mode: 'login' | 'signup';
  children: React.ReactNode;
}

const COPY = {
  login: { heading: 'Welcome back', sub: 'Log in to see how your teams are doing.' },
  signup: { heading: 'Join the league', sub: 'Create an account to start drafting.' },
};

const AuthLayout = ({ mode, children }: AuthLayoutProps) => {
  const navigate = useNavigate();

  const toggle = (key: 'login' | 'signup', label: string) => {
    const on = mode === key;
    return (
      <Box
        as="button"
        aria-pressed={on}
        onClick={() => !on && navigate(key === 'login' ? ROUTES.LOGIN : ROUTES.SIGNUP)}
        flex="1"
        minH="44px"
        rounded="10px"
        border="1px solid"
        borderColor={on ? '#5E7189' : 'transparent'}
        bg={on ? 'mist' : 'transparent'}
        color="ink"
        fontWeight={on ? 'bold' : 'medium'}
        fontSize="13px"
        cursor="pointer"
      >
        {label}
      </Box>
    );
  };

  return (
    <Flex
      position="relative"
      overflow="hidden"
      minH="100vh"
      p={{ base: 3, md: 8 }}
      align="center"
      justify="center"
      bg="page"
    >
      <Flex
        position="relative"
        wrap="wrap"
        w="full"
        maxW="1040px"
        border="2px solid"
        borderColor="line"
        rounded="panel"
        overflow="hidden"
        bg="card"
      >
        <Flex
          position="relative"
          overflow="hidden"
          direction="column"
          gap="5"
          flex="1 1 440px"
          minH={{ base: '260px', md: '600px' }}
          p="9"
          color="sidebarText"
          bg="sidebar"
        >
          <Box position="absolute" right="28px" top="24px">
            <Snowflake size={64} opacity={0.85} />
          </Box>
          <Flex align="center" gap="3">
            <PuckMark size={46} />
            <Text
              fontFamily="heading"
              fontWeight="bold"
              fontSize="30px"
              lineHeight="1"
              color="white"
            >
              Hockey Pockey
            </Text>
          </Flex>
          <Box maxW="340px">
            <Heading as="h2" fontSize="24px" lineHeight="1.2" mb="2" color="white">
              Pick your teams. Watch the points pile up.
            </Heading>
            <Text fontSize="13px" color="#C3D3E6">
              A simple NHL draft with your friends. Claim teams, follow the games, and see
              who&apos;s on top.
            </Text>
          </Box>
        </Flex>

        <Flex
          direction="column"
          justify="center"
          gap="4"
          flex="1 1 400px"
          px={{ base: 6, md: 10 }}
          py="9"
        >
          <Box className="rise">
            <Heading as="h1" fontSize="28px" lineHeight="1.15">
              {COPY[mode].heading}
            </Heading>
            <Text mt="1.5" fontSize="13px" color="inkMuted">
              {COPY[mode].sub}
            </Text>
          </Box>
          <Flex
            role="group"
            aria-label="Log in or create account"
            gap="1"
            p="1"
            rounded="14px"
            bg="ownerNone"
            border="1px solid #B3C1D0"
          >
            {toggle('login', 'Log in')}
            {toggle('signup', 'Sign up')}
          </Flex>
          {children}
        </Flex>
      </Flex>
      <FrostOverlay />
    </Flex>
  );
};

export default AuthLayout;
