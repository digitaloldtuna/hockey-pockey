import { Flex } from '@chakra-ui/react';

type Props = {
  marginX?: string;
  children: React.ReactNode;
};

const Layout = ({ marginX, children }: Props) => {
  return (
    <Flex
      marginX={marginX}
      paddingX={{ base: 4, sm: 6, md: 12, lg: 20 }} // reduced on small screens
      paddingTop={{ base: 4, sm: 6, md: 8, lg: 10 }} // reduced on small screens
      gap={{ base: 3, md: 5 }} // smaller gap on mobile
      direction="column"
    >
      {children}
    </Flex>
  );
};

export default Layout;
