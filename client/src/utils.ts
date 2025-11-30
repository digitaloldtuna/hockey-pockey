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

  if (date === today) {
    date = `Today - ${prettyDate}`;
  } else if (date === tomorrow) {
    date = `Tomorrow - ${prettyDate}`;
  } else {
    date = prettyDate;
  }

  return date;
};
