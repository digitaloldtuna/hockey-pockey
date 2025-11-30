export const getApiSeason = (season: number) => {
  const seasonMappings: Record<string, number> = {
    2026: 20252026,
  };
  return seasonMappings[String(season)];
};
