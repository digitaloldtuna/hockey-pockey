import { Box, defineKeyframes } from '@chakra-ui/react';

// Animate blobs with larger, more dynamic movement
const blobAnimation = defineKeyframes({
  '0%': { backgroundPosition: '10% 20%, 80% 70%, 50% 50%' as any },
  '20%': { backgroundPosition: '30% 40%, 60% 50%, 70% 60%' as any },
  '40%': { backgroundPosition: '20% 60%, 70% 30%, 40% 40%' as any },
  '60%': { backgroundPosition: '25% 35%, 75% 65%, 60% 45%' as any },
  '80%': { backgroundPosition: '15% 50%, 85% 40%, 50% 60%' as any },
  '100%': { backgroundPosition: '10% 20%, 80% 70%, 50% 50%' as any },
});

export default function BlobbyGrainBackground() {
  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      width="100%"
      height="100%"
      minW="100vw"
      minH="100vh"
      zIndex={1}
      backgroundColor="#8BBBD9" // Base color (highElfBlue)
      overflow="hidden"
      _before={{
        content: '""',
        position: 'absolute',
        inset: 0,
        backgroundImage: `
            radial-gradient(circle at 10% 20%, #759CBF 0%, transparent 40%),  /* blueMountain */
            radial-gradient(circle at 80% 70%, #B6DBF2 0%, transparent 40%),  /* dilutedBlue */
            radial-gradient(circle at 50% 50%, #759CBF 0%, transparent 50%)   /* blueMountain */
          `,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        animationName: blobAnimation,
        animationDuration: '18s',
        animationTimingFunction: 'ease-in-out',
        animationIterationCount: 'infinite',
        filter: 'blur(120px)',
        zIndex: 1,
      }}
      _after={{
        content: '""',
        position: 'absolute',
        inset: 0,
        backgroundImage: "url('/frost-texture.jpg')",
        backgroundRepeat: 'repeat',
        opacity: 0.2,
        pointerEvents: 'none',
      }}
    />
  );
}
