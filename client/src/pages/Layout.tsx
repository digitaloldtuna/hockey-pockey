import { Box, Flex } from '@chakra-ui/react';

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  return (
    <Flex paddingX="20" paddingY="10" gap="5" direction="column">
      {children}
    </Flex>
  );
};

export default Layout;
