import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import { lazy, Suspense } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

const IceTitle = lazy(() => import('../../components/IceTitle'));

const COPY = {
  login: { heading: 'Welcome back', sub: 'Log in to see how your teams are doing.' },
  signup: { heading: 'Join the league', sub: 'Create an account to start drafting.' },
};

// Wraps both auth routes, so the 3D title and background stay mounted when switching tabs
const AuthLayout = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const mode: 'login' | 'signup' = pathname === ROUTES.SIGNUP ? 'signup' : 'login';

  const toggle = (key: 'login' | 'signup', label: string) => {
    const on = mode === key;
    return (
      <Box
        as="button"
        aria-pressed={on}
        onClick={() => !on && navigate(key === 'login' ? ROUTES.LOGIN : ROUTES.SIGNUP)}
        flex="1"
        minH="36px"
        rounded="10px"
        border="1px solid"
        borderColor={on ? '#5E7189' : 'transparent'}
        bg={on ? 'mist' : 'transparent'}
        color="ink"
        fontWeight={on ? 'bold' : 'medium'}
        fontSize="12px"
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
      px={{ base: 4, md: 8 }}
      py={{ base: 6, md: 8 }}
      color="ink"
      bg="#071b33"
    >
      {/* brand area, straight on the page background */}
      <Flex
        position="relative"
        direction="column"
        align="center"
        gap="4"
        flex={{ base: 'none', lg: '1 1 0' }}
        w="full"
        maxW="920px"
        minW="0"
      >
        <Suspense fallback={<Box w="full" aspectRatio="1.7" />}>
          <IceTitle />
        </Suspense>
      </Flex>

      {/* login / signup card */}
      <Flex
        position="relative"
        direction="column"
        gap="3"
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
        <Box key={mode} className="rise">
          <Heading as="h1" fontSize="24px" lineHeight="1.15">
            {COPY[mode].heading}
          </Heading>
          <Text mt="1" fontSize="12px" color="inkMuted">
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
        <Outlet />
      </Flex>
    </Flex>
  );
};

export default AuthLayout;
