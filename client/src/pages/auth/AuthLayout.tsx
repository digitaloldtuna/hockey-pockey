import { Box, Flex, Grid, Text } from '@chakra-ui/react';
import BlobbyGrainBackground from '../../components/BlobbyBackground';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <Box position="relative" minH="100vh">
      <BlobbyGrainBackground />
      <Flex position="relative" zIndex={2} minH="100vh">
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} minH="100%" minW="100%">
          {/* Left side: title */}
          <Flex
            align="center"
            justify="center"
            p={{ base: 6, md: 0 }}
            textAlign={{ base: 'center', md: 'left' }}
          >
            <Text
              fontSize={{ base: '70px', md: '150px' }}
              lineHeight="0.75"
              fontWeight="bold"
              color="white"
              fontFamily="heading"
            >
              hockey
              <br />
              pockey
            </Text>
          </Flex>

          {/* Right side: form */}
          <Flex p={{ base: 6, md: 10 }} w="full" align="center" justify="center">
            {children}
          </Flex>
        </Grid>
      </Flex>
    </Box>
  );
};

export default AuthLayout;
