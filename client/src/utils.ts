import { Game } from './constants/types';

// palette colours for the team tags
const DivisionColour: Record<string, string> = {
  Metropolitan: 'ownerFlame',
  Atlantic: 'ownerSage',
  Pacific: 'ownerSky',
  Central: 'ownerSun',
};

const ConferenceColour: Record<string, string> = {
  Eastern: 'ownerLavender',
  Western: 'ownerIce',
};

export const getDivisionColour = (division: string) => DivisionColour[division];
export const getConferenceColour = (conference: string) => ConferenceColour[conference];

export const formatDate = (date: string, pretty?: boolean) => {
  const now = new Date();

  now.setDate(now.getDate() + 1);

  // Format function
  const prettyDate = new Date(date + 'T05:00:00Z').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long', // full month name
    day: 'numeric',
  });

  if (pretty === undefined || !pretty) {
    return prettyDate;
  }

  return prettyDate;
};

// Owner colours from the design library, picked deterministically per member
// orange is left out on purpose: it means a loss elsewhere in the app
const ownerPalette = ['ownerLavender', 'ownerSky', 'ownerSage', 'ownerSun', 'ownerIce'];

// raw values for SVG fills, which can't read Chakra token names
export const OWNER_HEX: Record<string, string> = {
  ownerLavender: '#E5C9E7',
  ownerSky: '#6ECAF3',
  ownerSage: '#C2E6AE',
  ownerSun: '#FFE398',
  ownerFlame: '#FF9767',
  ownerIce: '#C8DDF8',
  ownerNone: '#DCE5EE',
};

export const getOwnerColour = (id?: string) => {
  if (!id) return 'ownerNone';
  const hash = Array.from(id).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return ownerPalette[hash % ownerPalette.length];
};

type Coloured = { id: string; colour?: string | null };

// the palette colours offered in the profile colour picker
export const PROFILE_COLOURS = [
  '#E5C9E7',
  '#8B0C49',
  '#FF9767',
  '#FFE398',
  '#A87014',
  '#F9F52D',
  '#1E6949',
  '#C2E6AE',
  '#C8DDF8',
  '#6ECAF3',
];

// a member's own colour if they picked one, otherwise a steady default (a CSS colour or theme token)
export const memberColour = (member?: Coloured) => member?.colour || getOwnerColour(member?.id);

// the same, always as a hex value, for SVG and canvas
export const memberHex = (member?: Coloured) =>
  member?.colour || OWNER_HEX[getOwnerColour(member?.id)];

// white or dark text, whichever stays readable on a hex background
export const readableOn = (hex?: string | null) => {
  const match = hex && /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) return 'ink';
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(match[1].slice(i, i + 2), 16) / 255);
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const luminance = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return luminance < 0.3 ? 'white' : 'ink';
};

// today's date (YYYY-MM-DD) in Eastern time, matching game dates
export const todayET = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());

// get time in HH:MM (AM or PM)
export const formatTime12 = (iso: string): string => {
  const [hourStr, minuteStr] = iso.split('T')[1].split('+')[0].split(':');
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${minuteStr} ${ampm}`;
};

export type Result = 'win' | 'loss' | 'self' | 'none';

// outcome of a game from one member's point of view
export const getResult = (game: Game, profileId?: string): Result => {
  if (!profileId) return 'none';
  const sameOwner =
    game.homeMember?.id && game.visitingMember?.id && game.visitingMember.id === game.homeMember.id;
  if (sameOwner) return game.homeMember?.id === profileId ? 'self' : 'none';
  const homeWon = game.homeScore > game.visitingScore;
  if (game.homeMember?.id === profileId) return homeWon ? 'win' : 'loss';
  if (game.visitingMember?.id === profileId) return homeWon ? 'loss' : 'win';
  return 'none';
};

// Place numbers for a list sorted best-first. Entries with the same key are tied and share a place,
// and the next place skips ahead: scores of 9, 7, 7, 5 are places 1, 2, 2, 4.
export const placements = <T>(sorted: T[], keyOf: (item: T) => string | number): number[] => {
  const places: number[] = [];
  sorted.forEach((item, i) => {
    places.push(i > 0 && keyOf(item) === keyOf(sorted[i - 1]) ? places[i - 1] : i + 1);
  });
  return places;
};
