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
