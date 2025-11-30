export const getApiSeason = (season: number) => {
  const seasonMappings: Record<string, number> = {
    2025: 20242025,
    2026: 20252026,
    2027: 20262027,
  };
  return seasonMappings[String(season)];
};
