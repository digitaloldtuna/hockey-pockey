import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        body: { value: "'Geist Mono', monospace" },
        heading: { value: "'Arvo', serif" },
      },
      radii: {
        card: { value: '16px' },
        panel: { value: '28px' },
      },
      fontWeights: {
        hairline: { value: '100' },
        thin: { value: '200' },
        light: { value: '300' },
        normal: { value: '400' }, // default body weight
        medium: { value: '500' },
        semibold: { value: '600' },
        bold: { value: '700' }, // default heading weight
        extrabold: { value: '800' },
        black: { value: '900' },
      },
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

        // design library
        ink: { value: '#16263A' },
        inkMuted: { value: '#4F6378' },
        page: { value: '#E3EBF3' },
        card: { value: '#F4F8FB' },
        line: { value: '#8FA1B5' },
        lineSoft: { value: '#C9D6E4' },
        sidebar: { value: '#2E4058' },
        sidebarRaised: { value: '#3E5471' },
        sidebarText: { value: '#EAF1F8' },
        sidebarMuted: { value: '#B7C8DC' },
        mist: { value: '#C3CED9' },
        ownerPink: { value: '#F7B2CF' },
        ownerBlue: { value: '#A9C2F7' },
        ownerMint: { value: '#A6E3CB' },
        ownerYellow: { value: '#F7E08A' },
        ownerNone: { value: '#DCE5EE' },
        loss: { value: '#F5B5B0' },
        pinkWash: { value: '#FBEAF1' },
      },
    },
  },
  globalCss: {
    body: {
      bg: 'page',
      color: 'ink',
      fontVariantNumeric: 'tabular-nums',
      fontFamily: 'body !important',
      fontWeight: 'normal',
    },
    html: {
      colorPalette: 'blue',
    },
    h1: { fontFamily: 'heading', fontWeight: 'bold' },
    h2: { fontFamily: 'heading', fontWeight: 'bold' },
    h3: { fontFamily: 'heading', fontWeight: 'bold' },
    h4: { fontFamily: 'heading', fontWeight: 'bold' },
    h5: { fontFamily: 'heading', fontWeight: 'bold' },
    h6: { fontFamily: 'heading', fontWeight: 'bold' },
    p: { fontFamily: 'body' },
    button: { fontFamily: 'heading', fontWeight: 'hairline' },
    input: { fontFamily: 'body' },
    textarea: { fontFamily: 'body' },
  },
});

export const system = createSystem(defaultConfig, config);
