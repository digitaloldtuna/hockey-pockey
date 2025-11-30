const seasonMappings: Record<string, number> = {
  2025: 20242025,
  2026: 20252026,
  2027: 20262027,
};

export const getApiSeason = (season: number) => {
  return seasonMappings[String(season)];
};

const pointMapping: Record<string, number> = {
  2: 1,
  3: 2,
};

const finalGameMapping: Record<string, number> = {
  20242025: 2024030416,
};

export const getPoint = (gameType: number) => {
  return pointMapping[String(gameType)];
};

export const isFinalGame = (season: number, gameId: number) => {
  return finalGameMapping[String(season)] === gameId;
};
