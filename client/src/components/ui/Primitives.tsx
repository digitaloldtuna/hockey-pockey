import { Box, Flex, Heading, Image, Text } from '@chakra-ui/react';
import { ReactNode } from 'react';

export const PageHeader = ({ title, note }: { title: ReactNode; note?: ReactNode }) => (
  <Flex wrap="wrap" align="baseline" justify="space-between" columnGap="4" rowGap="1">
    <Heading as="h1" fontSize="28px" lineHeight="1.1">
      {title}
    </Heading>
    {note && (
      <Text color="inkMuted" fontWeight="medium">
        {note}
      </Text>
    )}
  </Flex>
);

export const Surface = ({
  children,
  ...rest
}: { children: ReactNode } & React.ComponentProps<typeof Box>) => (
  <Box
    bg="card"
    border="1px solid"
    borderColor="line"
    rounded="card"
    overflow="hidden"
    minW="0"
    {...rest}
  >
    {children}
  </Box>
);

export const StatTile = ({
  label,
  value,
  sub,
  bg,
  delay = '0s',
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  bg: string;
  delay?: string;
}) => (
  <Box
    className="pop"
    style={{ animationDelay: delay }}
    px="14px"
    pt="10px"
    pb="12px"
    rounded="card"
    bg={bg}
    border="1px solid #6F8199"
    transition="transform .18s ease"
    _hover={{ transform: 'translateY(-2px)' }}
  >
    <Text fontWeight="semibold" fontSize="11px" letterSpacing="0.08em" textTransform="uppercase">
      {label}
    </Text>
    <Text fontFamily="heading" fontWeight="bold" fontSize="32px" lineHeight="1.15">
      {value}
    </Text>
    {sub && (
      <Text fontSize="11px" fontWeight="medium">
        {sub}
      </Text>
    )}
  </Box>
);

export const DayHeader = ({
  title,
  right,
  children,
}: {
  title: string;
  right?: ReactNode;
  children?: ReactNode;
}) => (
  <Flex
    align="center"
    gap="2"
    px="14px"
    py="2"
    bg="lineSoft"
    borderTop="1px solid"
    borderColor="line"
  >
    <Heading
      as="h2"
      fontSize="13px"
      letterSpacing="0.04em"
      textTransform="uppercase"
      color="ink"
      m="0"
    >
      {title}
    </Heading>
    {children}
    <Box ml="auto" fontSize="11px" fontWeight="medium" color="inkMuted">
      {right}
    </Box>
  </Flex>
);

export const Pill = ({
  children,
  bg,
  blink,
}: {
  children: ReactNode;
  bg: string;
  blink?: boolean;
}) => (
  <Text
    as="span"
    className={blink ? 'blink' : undefined}
    display="inline-block"
    px="2"
    py="2px"
    rounded="10px"
    bg={bg}
    fontWeight="semibold"
    fontSize="10px"
    color="ink"
  >
    {children}
  </Text>
);

export const FilterChip = ({
  label,
  pressed,
  onClick,
}: {
  label: string;
  pressed: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    aria-pressed={pressed}
    onClick={onClick}
    style={{
      minHeight: 44,
      padding: '0 18px',
      borderRadius: 22,
      border: `1px solid ${pressed ? '#5E7189' : '#8FA1B5'}`,
      background: pressed ? '#C3CED9' : '#F4F8FB',
      color: '#16263A',
      fontFamily: 'inherit',
      fontWeight: 600,
      fontSize: 12,
      cursor: 'pointer',
    }}
  >
    {label}
  </button>
);

// team logo on top of the owner's colour
export const TeamAvatar = ({
  logo,
  code,
  colour,
}: {
  logo?: string;
  code?: string;
  colour: string;
}) => (
  <Flex
    w="36px"
    h="36px"
    flex="none"
    align="center"
    justify="center"
    rounded="full"
    bg={colour}
    border="1px solid #4B6079"
    fontWeight="bold"
    fontSize="10px"
  >
    {logo ? <Image src={logo} alt={code} boxSize="26px" fit="contain" /> : code}
  </Flex>
);
