import { Box, Flex, Text } from '@chakra-ui/react';
import { ArrowLeft, LogOut, Menu, X } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useAuthentication } from '../../hooks/useAuthentication';
import { FrostOverlay, PuckMark, Snowflake } from './Brand';

export type NavItem = {
  key: string;
  label: string;
  icon: ReactNode;
  active: boolean;
  onClick: () => void;
};

export type BackLink = { label: string; onClick: () => void };

export const SidebarButton = ({
  active,
  onClick,
  icon,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
}) => (
  <Box
    as="button"
    aria-current={active ? 'page' : undefined}
    onClick={onClick}
    display="flex"
    alignItems="center"
    gap="10px"
    minH="44px"
    px="12px"
    rounded="12px"
    border="1px solid"
    borderColor={active ? '#5E7189' : 'transparent'}
    bg={active ? 'mist' : 'transparent'}
    color={active ? 'ink' : 'sidebarText'}
    fontWeight={active ? 'bold' : 'medium'}
    fontSize="13px"
    textAlign="left"
    cursor="pointer"
    transition="background .15s ease"
    _hover={{ bg: active ? 'mist' : 'sidebarRaised' }}
  >
    {icon}
    {children}
  </Box>
);

const BackButton = ({ back }: { back: BackLink }) => (
  <SidebarButton onClick={back.onClick} icon={<ArrowLeft size={18} />}>
    {back.label}
  </SidebarButton>
);

const Brand = ({ size }: { size: number }) => {
  const navigate = useNavigate();
  return (
    <Box
      as="button"
      onClick={() => navigate(ROUTES.HOME)}
      display="flex"
      alignItems="center"
      gap="10px"
      minH="44px"
      textAlign="left"
      cursor="pointer"
      aria-label="Hockey Pockey home"
    >
      <PuckMark size={size} />
      <Text fontFamily="heading" fontWeight="bold" fontSize="18px" lineHeight="1" color="white">
        Hockey Pockey
      </Text>
    </Box>
  );
};

// phone/tablet: a compact top bar that stays pinned, with the extras behind a menu button
const MobileBar = ({
  nav,
  aside,
  back,
  showBrand,
}: {
  nav?: NavItem[];
  aside?: ReactNode;
  back?: BackLink;
  showBrand?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const { handleLogout } = useAuthentication();

  return (
    <Box
      display={{ base: 'block', md: 'none' }}
      position="sticky"
      top="3"
      zIndex="10"
      m="3"
      mb="0"
      color="sidebarText"
      bg="sidebar"
      border="2px solid"
      borderColor="mist"
      rounded="card"
      overflow="hidden"
    >
      <Flex align="center" gap="2" px="3" py="1.5">
        {showBrand && <Brand size={30} />}
        <Flex flex="1" justify="space-between" gap="1">
          {nav?.map((item) => (
            <Box
              key={item.key}
              as="button"
              aria-label={item.label}
              aria-current={item.active ? 'page' : undefined}
              onClick={item.onClick}
              display="flex"
              alignItems="center"
              justifyContent="center"
              w="44px"
              h="44px"
              rounded="12px"
              border="1px solid"
              borderColor={item.active ? '#5E7189' : 'transparent'}
              bg={item.active ? 'mist' : 'transparent'}
              color={item.active ? 'ink' : 'sidebarText'}
              cursor="pointer"
            >
              {item.icon}
            </Box>
          ))}
          <Box
            as="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            ml="auto"
            onClick={() => setOpen(!open)}
            display="flex"
            alignItems="center"
            justifyContent="center"
            w="44px"
            h="44px"
            rounded="12px"
            cursor="pointer"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </Box>
        </Flex>
      </Flex>
      {open && (
        <Flex direction="column" gap="3" px="3" pb="3" maxH="70vh" overflow="auto">
          {aside}
          {back && <BackButton back={back} />}
          <SidebarButton onClick={handleLogout} icon={<LogOut size={18} />}>
            Log out
          </SidebarButton>
        </Flex>
      )}
    </Box>
  );
};

// persistent left sidebar on desktop, pinned top bar on mobile
const AppShell = ({
  nav,
  aside,
  back,
  showBrand,
  children,
}: {
  nav?: NavItem[];
  aside?: ReactNode;
  back?: BackLink;
  showBrand?: boolean;
  children: ReactNode;
}) => {
  const { handleLogout } = useAuthentication();

  return (
    <Flex
      position="relative"
      overflow="clip"
      minH="100vh"
      direction={{ base: 'column', md: 'row' }}
      align="stretch"
      bg="page"
    >
      <MobileBar nav={nav} aside={aside} back={back} showBrand={showBrand} />

      <Flex
        as="aside"
        display={{ base: 'none', md: 'flex' }}
        flex="none"
        w="260px"
        m="4"
        alignSelf="flex-start"
        position="sticky"
        top="4"
        h="calc(100vh - 32px)"
        overflow="auto"
        direction="column"
        gap="4"
        px="4"
        py="18px"
        color="sidebarText"
        bg="sidebar"
        border="2px solid"
        borderColor="mist"
        rounded="panel"
      >
        <Brand size={38} />

        {aside}

        {back && <BackButton back={back} />}

        {nav && (
          <Box>
            <Text
              px="10px"
              pb="6px"
              fontWeight="bold"
              fontSize="10px"
              letterSpacing="0.12em"
              textTransform="uppercase"
              color="#A9BCD2"
            >
              Menu
            </Text>
            <Flex as="nav" aria-label="Main" direction="column" gap="1">
              {nav.map((item) => (
                <SidebarButton
                  key={item.key}
                  active={item.active}
                  onClick={item.onClick}
                  icon={item.icon}
                >
                  {item.label}
                </SidebarButton>
              ))}
            </Flex>
          </Box>
        )}

        <Box alignSelf="center" mt="auto">
          <Snowflake />
        </Box>

        <SidebarButton onClick={handleLogout} icon={<LogOut size={18} />}>
          Log out
        </SidebarButton>
      </Flex>

      <Flex
        as="main"
        flex="1"
        minW="0"
        direction="column"
        gap="4"
        px={{ base: 3, md: 6 }}
        pt={{ base: 4, md: 5 }}
        pb="7"
      >
        {children}
      </Flex>

      <FrostOverlay />
    </Flex>
  );
};

export default AppShell;
