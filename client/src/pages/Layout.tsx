import { Box, Flex } from '@chakra-ui/react';

type Props = {
  marginX?: string;
  children: React.ReactNode;
};

const Layout = ({ marginX, children }: Props) => {
  return (
    <Flex marginX={marginX} paddingX="20" paddingY="10" gap="5" direction="column">
      {children}
    </Flex>
  );
};

export default Layout;
