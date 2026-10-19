import { Box, Flex, Heading, Image, Text } from '@chakra-ui/react';
import { lazy, ReactNode, Suspense } from 'react';

// loaded on demand so three.js stays out of the main bundle
const IceTitle = lazy(() => import('../IceTitle'));
const TITLE_HEIGHT = 62;

export const PageHeader = ({ title, note }: { title: ReactNode; note?: ReactNode }) => (
  <Flex wrap="wrap" align="center" justify="space-between" columnGap="4" rowGap="1">
    {typeof title === 'string' ? (
      // the title is drawn as moving ice; the label keeps it readable to screen readers
      <Box role="heading" aria-level={1} maxW="100%">
        <Suspense fallback={<Box h={`${TITLE_HEIGHT}px`} />}>
          <IceTitle
            lines={[title]}
            height={TITLE_HEIGHT}
            chips={6}
            puck={false}
            align="left"
            stroke={0.75}
            bleed="-110% -4%"
            fallbackColor="var(--chakra-colors-sidebarText)"
          />
        </Suspense>
      </Box>
    ) : (
      <Heading as="h1" fontSize="28px" lineHeight="1.1">
        {title}
      </Heading>
    )}
    {note && (
      <Text color="sidebarMuted" fontWeight="medium">
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
  color = 'ink',
  blink,
}: {
  children: ReactNode;
  bg: string;
  color?: string;
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
    color={color}
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
