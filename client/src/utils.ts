import { Game } from './constants/types';

const colorPalette = ['red', 'blue', 'yellow', 'purple', 'orange'];

export const getAvatarColour = (name: string) => {
  const index = name.charCodeAt(0) % colorPalette.length;
  return colorPalette[index];
};

const DivisionColour: Record<string, string> = {
  Metropolitan: 'red',
  Atlantic: 'green',
  Pacific: 'blue',
  Central: 'yellow',
};

const ConferenceColour: Record<string, string> = {
  Eastern: 'yellow',
  Western: 'red',
};

export const getDivisionColour = (division: string) => DivisionColour[division];
export const getConferenceColour = (conference: string) => ConferenceColour[conference];

export const formatDate = (date: string, pretty?: boolean) => {
  const now = new Date();

  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
  }).format(now);

  now.setDate(now.getDate() + 1);
  const tomorrow = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
  }).format(now);

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
const ownerPalette = ['ownerPink', 'ownerBlue', 'ownerMint', 'ownerYellow'];

// raw values for SVG fills, which can't read Chakra token names
export const OWNER_HEX: Record<string, string> = {
  ownerPink: '#F7B2CF',
  ownerBlue: '#A9C2F7',
  ownerMint: '#A6E3CB',
  ownerYellow: '#F7E08A',
  ownerNone: '#DCE5EE',
};

export const getOwnerColour = (id?: string) => {
  if (!id) return 'ownerNone';
  const hash = Array.from(id).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return ownerPalette[hash % ownerPalette.length];
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
