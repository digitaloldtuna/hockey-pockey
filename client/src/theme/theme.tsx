import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        salmonRose: { value: '#FF8E97' },
        toastedTruffle: { value: '#A62E44' },
        dissolvedDenim: { value: '#E1EBF3' },
        iceEffect: { value: '#C9E7F2' },
        dilutedBlue: { value: '#B6DBF2' },
        highElfBlue: { value: '#8BBBD9' },
        blueMountain: { value: '#759CBF' },
        odyssey: { value: '#384A59' },
        oxford: { value: '#050B22' },
      },
    },
  },
  globalCss: {
    body: {
      bg: 'dissolvedDenim',
    },
    html: {
      colorPalette: 'blue',
    },
  },
});

export const system = createSystem(defaultConfig, config);
