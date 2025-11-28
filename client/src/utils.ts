const colorPalette = ['red', 'blue', 'yellow', 'purple', 'orange'];

export const getAvatarColour = (name: string) => {
  const index = name.charCodeAt(0) % colorPalette.length;
  return colorPalette[index];
};
