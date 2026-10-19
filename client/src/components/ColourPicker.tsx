import { Box, Flex } from '@chakra-ui/react';
import { PROFILE_COLOURS } from '../utils';

const sameColour = (a?: string, b?: string) => !!a && !!b && a.toLowerCase() === b.toLowerCase();

// shown on the sidebar's dark background, so the selection ring is light
const ring = '0 0 0 2px #071B33, 0 0 0 4px #EAF1F8';

const circle = (colour: string, selected: boolean): React.CSSProperties => ({
  width: 26,
  height: 26,
  borderRadius: '50%',
  border: '1px solid rgba(234, 241, 248, 0.35)',
  background: colour,
  padding: 0,
  cursor: 'pointer',
  boxShadow: selected ? ring : 'none',
  transition: 'transform .12s ease, box-shadow .12s ease',
});

// a grid of selectable circles: the palette colours, then one that opens the browser's own picker
const ColourPicker = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (colour: string) => void;
}) => {
  const isCustom = !!value && !PROFILE_COLOURS.some((colour) => sameColour(colour, value));

  return (
    <Flex role="radiogroup" aria-label="Your colour" wrap="wrap" gap="8px">
      {PROFILE_COLOURS.map((colour) => {
        const selected = sameColour(colour, value);
        return (
          <button
            key={colour}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`Colour ${colour}`}
            onClick={() => onChange(colour)}
            style={circle(colour, selected)}
          />
        );
      })}

      <Box
        as="label"
        position="relative"
        display="block"
        w="26px"
        h="26px"
        aria-label="Pick a custom colour"
        title="Custom colour"
      >
        <span
          aria-hidden="true"
          style={{
            ...circle('transparent', isCustom),
            display: 'block',
            background: isCustom
              ? value
              : 'conic-gradient(#ef7a44, #f0d385, #b1d1a0, #5aaed3, #d6bed8, #ef7a44)',
          }}
        />
        <input
          type="color"
          value={isCustom ? value : '#ffffff'}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: 'pointer',
          }}
        />
      </Box>
    </Flex>
  );
};

export default ColourPicker;
