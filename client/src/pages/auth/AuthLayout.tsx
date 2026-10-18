import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import { lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

const IceTitle = lazy(() => import('../../components/IceTitle'));

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
      direction={{ base: 'column', lg: 'row' }}
      align="center"
      justify="center"
      gap={{ base: 4, lg: 10 }}
      p={{ base: 4, md: 8 }}
      color="sidebarText"
      bgImage="linear-gradient(160deg, #4272b8 0%, #2f5390 100%)"
    >
      {/* brand area, straight on the page background */}
      <Flex
        position="relative"
        direction="column"
        align={{ base: 'center', lg: 'flex-start' }}
        textAlign={{ base: 'center', lg: 'left' }}
        gap="4"
        flex={{ base: 'none', lg: '1 1 0' }}
        w="full"
        maxW="920px"
        minW="0"
      >
        <Suspense fallback={<Box w="full" aspectRatio="1.7" />}>
          <IceTitle />
        </Suspense>
        <Box maxW="380px">
          <Heading as="h2" fontSize="24px" lineHeight="1.2" mb="2" color="white">
            Pick your teams. Watch the points pile up.
          </Heading>
          <Text fontSize="13px" color="#D5E3F5">
            A simple NHL draft with your friends. Claim teams, follow the games, and see who&apos;s
            on top.
          </Text>
        </Box>
      </Flex>

      {/* login / signup card */}
      <Flex
        position="relative"
        direction="column"
        gap="4"
        w="full"
        maxW="440px"
        flex="none"
        p={{ base: 6, md: 8 }}
        color="ink"
        bg="card"
        border="2px solid"
        borderColor="line"
        rounded="panel"
        boxShadow="0 18px 40px rgba(10, 25, 55, 0.35)"
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
  );
};

export default AuthLayout;
